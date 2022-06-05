import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { BuildSpec, LinuxBuildImage, PipelineProject } from 'aws-cdk-lib/aws-codebuild';
import {  Pipeline, Artifact } from "aws-cdk-lib/aws-codepipeline";
import { CloudFormationCreateUpdateStackAction, CodeBuildAction, GitHubSourceAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { Construct } from 'constructs';


export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new Pipeline(this, 'Pipeline',{
      pipelineName:'CDK-Demo-Pipeline',
      crossAccountKeys:false
    });

    const cdkPipelineSourceOutput =  new Artifact('CDK-Demo-Pipeline-Source-Output')
    const cdkServiceSourceOutput = new Artifact('CDK-Demo-Service-Source-Output')

    pipeline.addStage({
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
          branch: "master",
          actionName: "CDK-Demo-Service-Source",
          oauthToken: SecretValue.secretsManager("aws_github_cdk_demo"),
          output: cdkServiceSourceOutput,
        })
      ],
    });

    const cdkBuildOutput = new Artifact('CDK-Demo-Build-Output')
    const cdkServiceBuildOutput = new Artifact('CDK-Demo-Service-Build-Output')


    pipeline.addStage({
      stageName: 'Build',
      actions:[
        new CodeBuildAction({
          actionName:'CDK-Build',
          input:cdkPipelineSourceOutput,
          outputs:[cdkBuildOutput],
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
          outputs:[cdkServiceBuildOutput],
          project:new PipelineProject(this, 'CdkServiceBuildProject',{
            environment:{
              buildImage:LinuxBuildImage.STANDARD_5_0
            },
            buildSpec:BuildSpec.fromSourceFilename('build-specs/cdk-service-build-spec-yml')
          })
        })

      ]
    })

    pipeline.addStage({
      stageName:'Pipeline_Update',
      actions:[
        new CloudFormationCreateUpdateStackAction({
          actionName:'CDK-Pipeline-Update',
          stackName:'PipelineStack',
          templatePath:cdkBuildOutput.atPath('PipelineStack.template.json'),
          adminPermissions:true
        })
      ]
    })
  }
}
