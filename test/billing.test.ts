import * as cdk from 'aws-cdk-lib';
import {  Template } from 'aws-cdk-lib/assertions';
import { BillingStack } from '../lib/billing-stack';

test('Billing is Created', () => {
  const app = new cdk.App();
    // WHEN
  const stack = new BillingStack(app, 'MyTestStack',{
      EmailAddress:"test@gmail.com",
      BudgetAmount:5
  });
    // THEN
  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::Budgets::Budget",{
      Budget:{
        BudgetLimit:{
          Amount : 5
        }
      },
      NotificationsWithSubscribers:[{
        Subscribers:[{
          Address:"test@gmail.com"
        }]
      }]
  })

});
 