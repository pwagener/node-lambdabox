'use strict';

/**
 * This module provides a way to build Node modules within an AWS EC2 instance,
 * then download them for storage locally, then deploy them up to S3 for use
 * within a Lambda.
 *
 * TODO:  work in progress here.
 */

var Promise = require('bluebird');
var path = require('path');
var fs = Promise.promisifyAll(require('fs'));

var s3 = require('./s3Store');
var cloudFormation = require('./cloudformation');


function _deleteStack(stack) {
    return cloudFormation.deleteStackAsync({
        StackName: stack.StackName
    }).then(function() {
        output('Deleted stack "' + stack.StackName + '"');
    });
}

function _startNodeBuilderStack(config) {
    /*
    NOTE:  much of the CloudFormation template came from ...
https://s3-us-west-2.amazonaws.com/cloudformation-templates-us-west-2/VPC_Single_Instance_In_Subnet.template
     */
    var template = require('./module-builder.cf.json');

    // TODO:  parameter-ize these parameters
    var params = {
        StackName: config.name + '-stack',
        TemplateBody: JSON.stringify(template),
        Parameters: [
            { ParameterKey: "ProjectName", ParameterValue: config.name },
            { ParameterKey: "KeyName", ParameterValue: "pwagenerkey" },
            { ParameterKey: "SSHLocation", ParameterValue: "0.0.0.0/0" }
        ]
    }

    output('Creating Instance to build node modules.  This will take a few minutes');
    return cloudFormation.createStackAsync(params)
            .then(function(data) {
                return _waitForStack(data);
            }).then(function(stack) {
                output('Completed creation of "' + stack.StackName + "'");
                return data;
            }).catch(function(err) {
                output('Stack Creation failed: ' + err);
                return _deleteStack({
                    StackName: params.StackName
                });
            });
}

function deployNodeModules(config) {
    var nodeModules = config.node_modules;
    if (nodeModules && nodeModules.length) {
        // First start up an EC2 instance
        return _startNodeBuilderStack(config).then(function(stack) {
            output('... TODO:  learn flightplan to build & ZIP the modules ... ');
        }).then(function() {
            output('... TODO:  download the ZIP locally ... ');
        }).then(function() {
            output('... TODO:  upload the ZIP to S3 ... ');
        });
    } else {
        // Nothing to do ...
        debug('No Node Modules given in configuration');
        return new Promise.resolve();
    }
}

module.exports = {

    deploy: deployNodeModules

}