import { pipelines, SecretValue, Stack, StackProps, Stage, StageProps } from "aws-cdk-lib";
import { Artifact } from "aws-cdk-lib/aws-codepipeline";
import { GitHubTrigger } from "aws-cdk-lib/aws-codepipeline-actions";
import { ManualApprovalStep } from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";
import { MyApplicationStage } from "./myapplicationstage";
import { ServerStack } from "./server-stack";


export class PipelinesStack extends Stack{
    constructor(scope:Construct, id: string, props?:StackProps){
        super(scope, id, props)

        const cdkPipelineSourceOutput =  new Artifact('CDK-Demo-Pipeline-Source-Output')

        const pipeline = new pipelines.CodePipeline(this, 'Pipeline-v2', {
                pipelineName:'CDK-Demo-Pipeline-v2',
                selfMutation:true,
            
                synth: new pipelines.ShellStep('Synth', {
                    input : pipelines.CodePipelineSource.gitHub("rlamba89/aws-cdk-demo","master",{
                        authentication:SecretValue.secretsManager("aws_github_cdk_demo"),
                        trigger:GitHubTrigger.WEBHOOK
                    }),
                    commands: [
                      'npm install -g npm',
                      'npm install',
                      'npm run build',
                      'npm test',
                      'npm run cdk -- synth',
                    ],
                  }),
        });
        //new pipelines.p
        
        const UAT = pipeline.addStage(new MyApplicationStage(this, "Test",{
            StageName:'Test'
        }));

         UAT.addPost(new ManualApprovalStep ("Approve release to prod"));

        const Prod = pipeline.addStage(new MyApplicationStage(this, "Prod",{
            StageName : 'Prod'
        }));

    }
}

