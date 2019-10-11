import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const shared = new pulumi.StackReference(`get-cluster-example`)

const fargateClusterName = shared.requireOutput('fargateClusterName')
const fargateClusterId = shared.requireOutput('fargateClusterId')
const fargateVpcId = shared.requireOutput('fargateVpcId')
const fargateSecuityGroupIds: pulumi.Input<Array<string>> = shared.requireOutput('fargateSecuityGroupIds')


const cluster2 = new awsx.ecs.Cluster('example-crosswalk-cluster-from-get', {
    cluster: aws.ecs.Cluster.get('example-cluster', fargateClusterName),
    // vpc: new awsx.ec2.Vpc('cluster-vpc', {vpc: aws.ec2.Vpc.get('cluster-vpc', fargateVpcId)}),
    // securityGroups: []
})

// const cluster2 =  awsx.ecs.Cluster.getDefault({
//     id: fargateClusterId
// })

// export const fargateVpcId = cluster2.vpc.vpc.id
// export const fargateSecuityGroupIds = cluster2.securityGroups.map(group => group.id)