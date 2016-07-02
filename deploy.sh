#!/bin/bash

./node_modules/node-lambda/bin/node-lambda deploy -a $AWS_DEPLOY_USER_ACCESS_KEY -s $AWS_DEPLOY_USER_SECRET_KEY --role arn:aws:iam::810905322061:role/lambda_kinesis_role -e $DEPLOYMENT_ENV --configFile deploy.env