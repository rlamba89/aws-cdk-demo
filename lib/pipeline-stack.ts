import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { BuildSpec, LinuxBuildImage, PipelineProject } from 'aws-cdk-lib/aws-codebuild';
import {  Pipeline, Artifact } from "aws-cdk-lib/aws-codepipeline";
import { CloudFormationCreateUpdateStackAction, CodeBuildAction, GitHubSourceAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { Construct } from 'constructs';
import { ServerStack } from './server-stack';


export class PipelineStack extends Stack {
  private readonly pipeline :Pipeline;
  private readonly cdkBuildOutput:Artifact;
  private readonly cdkServiceBuildOutput:Artifact;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.pipeline = new Pipeline(this, 'Pipeline',{
      pipelineName:'CDK-Demo-Pipeline',
      crossAccountKeys:false,
      restartExecutionOnUpdate:true,
    });

    const cdkPipelineSourceOutput =  new Artifact('CDK-Demo-Pipeline-Source-Output')
    const cdkServiceSourceOutput = new Artifact('CDK-Demo-Service-Source-Output')

    this.pipeline.addStage({
      stageName: "Source",
      actions: [
        new GitHubSourceAction({
          owner: "rlamba89",
          repo: "aws-cdk-demo",
          branch: "master",
          actionName: "CDK-Demo-Pipeline-Source",
          oauthToken: SecretValue.secretsManager("aws_github_cdk_demo"),
          output: cdkPipelineSourceOutput,
        }),
        new GitHubSourceAction({
          owner: "rlamba89",
          repo: "express-lambda",
          branch: "main",
          actionName: "CDK-Demo-Service-Source",
          oauthToken: SecretValue.secretsManager("aws_github_cdk_demo"),
          output: cdkServiceSourceOutput,
        })
      ],
    });

    this.cdkBuildOutput = new Artifact('CDK-Demo-Build-Output')
    this.cdkServiceBuildOutput = new Artifact('CDK-Demo-Service-Build-Output')


    this.pipeline.addStage({
      stageName: 'Build',
      actions:[
        new CodeBuildAction({
          actionName:'CDK-Build',
          input:cdkPipelineSourceOutput,
          outputs:[this.cdkBuildOutput],
          project:new PipelineProject(this, 'CdkBuildProject',{
            environment:{
              buildImage:LinuxBuildImage.STANDARD_5_0
            },
            buildSpec:BuildSpec.fromSourceFilename('build-specs/cdk-build-spec.yml')
          })
        }),
        new CodeBuildAction({
          actionName:'CDK-Service-Build',
          input:cdkServiceSourceOutput,
          outputs:[this.cdkServiceBuildOutput],
          project:new PipelineProject(this, 'CdkServiceBuildProject',{
            environment:{
              buildImage:LinuxBuildImage.STANDARD_5_0
            },
            buildSpec:BuildSpec.fromSourceFilename('build-specs/cdk-service-build-spec.yml')
          })
        })

      ]
    })

    this.pipeline.addStage({
      stageName:'Pipeline_Update',
      actions:[
        new CloudFormationCreateUpdateStackAction({
          actionName:'CDK-Pipeline-Update',
          stackName:'PipelineStack',
          templatePath:this.cdkBuildOutput.atPath('PipelineStack.template.json'),
          adminPermissions:true
        })
      ]
    })
  }

  public addServiceStage(serviceStack: ServerStack, stageName:string){
    this.pipeline.addStage({
      stageName:stageName,
      actions:[
        new CloudFormationCreateUpdateStackAction({
          actionName:'CDK-Service-Deploy',
          stackName: serviceStack.stackName,
          templatePath:this.cdkBuildOutput.atPath(`${serviceStack.stackName}.template.json`),
          adminPermissions:true,
          parameterOverrides:{
            ...serviceStack.serviceCode.assign(this.cdkServiceBuildOutput.s3Location)
          },
          extraInputs:[this.cdkServiceBuildOutput]
        })
      ]
    })
  }
}
