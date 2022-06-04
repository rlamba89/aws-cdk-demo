import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { PipelineStack } from "../lib/pipeline-stack";

test('Pipeline test', () =>{
    const app = new App();

    //when
    const stack = new PipelineStack(app, 'MyTestPipelineStack')
    
    const template = Template.fromStack(stack);

    expect(template).toMatchSnapshot();
});