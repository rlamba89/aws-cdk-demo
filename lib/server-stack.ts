import {  BundlingOutput, CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Function, Runtime, Code, CfnParametersCode, FunctionUrlAuthType } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { HttpApi } from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration} from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as path from 'path';

interface ServerStackProps extends StackProps{
    StageName :string
}

export class ServerStack extends Stack {
    public readonly urlOutput: CfnOutput;
    public readonly serviceCode:CfnParametersCode;

    constructor(scope:Construct, id: string, props?:ServerStackProps){
        super(scope, id, props)
        console.log(path.resolve(process.cwd(), 'lambda'))
        
        // var lambda =new Function(this, `Lambda-${props?.StageName}`, {
        //     runtime: Runtime.NODEJS_14_X,
        //     handler: 'lambda.handler',
        //     code: Code.fromAsset(path.resolve(process.cwd(), 'lambda'),{
        //         bundling:{
        //             image:Runtime.NODEJS_14_X.bundlingImage,
        //             user:"root",
        //             command:['npm install']
        //         }
        //     }),
        //     functionName : `ServiceLambda-CDKDemo-${props?.StageName}`
        //  });

        var lambda =new Function(this, `Lambda-${props?.StageName}`, {
            runtime: Runtime.NODEJS_14_X,
            handler: 'lambda.handler',
            code: Code.fromAsset(path.resolve(process.cwd(), 'lambda')),
            functionName : `ServiceLambda-CDKDemo-${props?.StageName}`
         });

         const httpApi = new HttpApi(this, 'ServiceAPI', {
             defaultIntegration : new HttpLambdaIntegration(`LambdaIntegration-${props?.StageName}`,lambda),
             apiName:`MyService-CDkDemo-${props?.StageName}`
         });

         const fnUrl = lambda.addFunctionUrl({
            authType: FunctionUrlAuthType.NONE
         })

         this.urlOutput = new CfnOutput(this, 'LambdaUrl',{
            description:"lambda url",
            value: fnUrl.url,
         });
    }


}   