import {  CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Function, Runtime, Code, CfnParametersCode, FunctionUrlAuthType } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { HttpApi } from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration} from "@aws-cdk/aws-apigatewayv2-integrations-alpha";


interface LambdaStackProps extends StackProps{
    StageName :string
}

export class LambdaStack extends Stack {
    public readonly urlOutput: CfnOutput;
    public readonly serviceCode:CfnParametersCode;

    constructor(scope:Construct, id: string, props?:LambdaStackProps){
        super(scope, id, props)
         
        var lambdaaa =new Function(this, `Lambda-${props?.StageName}`, {
            runtime: Runtime.NODEJS_14_X,
            handler: 'lambda/lambda.handler',
            code: Code.fromAsset(""),
            functionName : `Lambda-CDKDemo-${props?.StageName}`
         });

         const httpApi = new HttpApi(this, 'ServiceAPI', {
             defaultIntegration : new HttpLambdaIntegration(`LambdaIntegration-${props?.StageName}`,lambdaaa),
             apiName:`MyService-CDkDemo-${props?.StageName}`
         });

         const fnUrl = lambdaaa.addFunctionUrl({
            authType: FunctionUrlAuthType.NONE
         })

         this.urlOutput = new CfnOutput(this, 'LambdaUrl',{
            description:"lambda url",
            value: fnUrl.url,
         });
    }


}   