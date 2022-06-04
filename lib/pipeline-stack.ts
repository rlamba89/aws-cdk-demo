import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { BuildSpec, LinuxBuildImage, PipelineProject } from 'aws-cdk-lib/aws-codebuild';
import {  Pipeline, Artifact } from "aws-cdk-lib/aws-codepipeline";
import { CodeBuildAction, GitHubSourceAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { Construct } from 'constructs';


export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new Pipeline(this, 'Pipeline',{
      pipelineName:'CDK-Demo-Pipeline',
      crossAccountKeys:false
    });

    const cdkSourceOutput =  new Artifact('CDK-Demo-Source-Output')
    
    pipeline.addStage({
      stageName: "Source",
      actions: [
        new GitHubSourceAction({
          owner: "rlamba89",
          repo: "aws-cdk-demo",
          branch: "master",
          actionName: "CDK-Demo-Pipeline-Source",
          oauthToken: SecretValue.secretsManager("aws_github_cdk_demo"),
          output: cdkSourceOutput,
        })
      ],
    });

    const cdkBuildOutput = new Artifact('CDK-Demo-Build-Output')

    pipeline.addStage({
      stageName: 'Build',
      actions:[
        new CodeBuildAction({
          actionName:'CDK-Build',
          input:cdkSourceOutput,
          outputs:[cdkBuildOutput],
          project:new PipelineProject(this, 'CdkBuildProject',{
            environment:{
              buildImage:LinuxBuildImage.STANDARD_5_0
            },
            buildSpec:BuildSpec.fromSourceFilename('build-specs/cdk-build-spec.yml')
          })
        })
      ]
    })
  }
}
