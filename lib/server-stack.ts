import {  Stack, StackProps } from "aws-cdk-lib";
import { Function, Runtime, Code, CfnParametersCode } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { HttpApi } from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration} from "@aws-cdk/aws-apigatewayv2-integrations-alpha";


interface ServerStackProps extends StackProps{
    StageName :string
}

export class ServerStack extends Stack {
    
    public readonly serviceCode:CfnParametersCode;

    constructor(scope:Construct, id: string, props?:ServerStackProps){
        super(scope, id, props)

         this.serviceCode = Code.fromCfnParameters()

        var lambda =new Function(this, 'Function', {
            runtime: Runtime.NODEJS_14_X,
            handler: 'source/lambda.handler',
            code: this.serviceCode,
            functionName : 'ServiceLambda-CDKDemo'
         });

         const httpApi = new HttpApi(this, 'ServiceAPI', {
             defaultIntegration : new HttpLambdaIntegration("LambdaIntegration",lambda),
             apiName:`MyService-CDkDemo-${props?.StageName}`
         });
    }
}