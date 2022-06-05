import { CfnOutput, Stage, StageProps } from "aws-cdk-lib"
import { Construct } from "constructs"
import { ServerStack } from "./server-stack"

interface IApplicationStageProps extends StageProps{
    StageName:string
}

export class MyApplicationStage extends Stage{
    public readonly urlOutput: CfnOutput;
    constructor(scope: Construct, id: string, props: IApplicationStageProps) {
        super(scope, id, props)
        
        const lambdaServerStack = new ServerStack(this, `CDK-Lambda-Stack-${props.StageName}`,{
            StageName : props.StageName
        })

        this.urlOutput = lambdaServerStack.urlOutput
    }
}