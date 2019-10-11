import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const cluster = new awsx.ecs.Cluster('example-cluster', {
})

export const fargateClusterUrn = cluster.urn
export const fargateClusterId = cluster.id
export const fargateClusterName = cluster.cluster.name
export const fargateVpcId = cluster.vpc.vpc.id
export const fargateSecuityGroupIds = cluster.securityGroups.map(group => group.id)