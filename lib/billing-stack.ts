import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Budget } from "./constructs/budget";

interface BillingStackProps extends StackProps{
    BudgetAmount : number,
    EmailAddress : string
}

export class BillingStack extends Stack {

    constructor(scope: Construct, id: string, props: BillingStackProps){
        super(scope, id, props);

        new Budget(this, "Budget", {
            emailAddress: props.EmailAddress,
            budgetAmount:props.BudgetAmount
        })
    }
} 