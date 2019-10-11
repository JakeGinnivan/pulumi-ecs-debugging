# Get cluster issues

## 1. is param should actually be cluster name?

If you pass the provider id, you get an error along the lines of 

aws:ecs:Cluster (content-platform-fargate):
    error: Preview failed: refreshing urn:pulumi:branch-1::content-apis-app::aws:ecs/cluster:Cluster::content-platform-fargate: error reading ECS Cluster (arn:aws:ecs:ap-southeast-2:291971919224:cluster/arn:aws:ecs:ap-southeast-2:291971919224:cluster/fargate-cluser-branch-deploys): InvalidParameterException: Invalid identifier: Unexpected number of separators
        status code: 400, request id: 7595e9ee-e4ee-4a9b-9ad1-0fa01f5daf26

### Fixed by using the aws.ec2.cluster.name instead of the urn of the awsx type.

## 2. Can't use getDefault to get exisiting cluster

Error: Cannot read an existing resource unless it has a custom provider

```
const cluster2 =  awsx.ecs.Cluster.getDefault({
    id: fargateClusterId
})
```

## 3. Need to specify cluser, sg's and vpc if getting existing

```
    Type                                          Name                             Status      
 +   pulumi:pulumi:Stack                           get-cluster-get-cluster-example  created     
 +   ├─ awsx:x:ecs:Cluster                         example-cluster                  created     
 +   │  ├─ aws:ecs:Cluster                         example-cluster                  created     
 +   │  └─ awsx:x:ec2:SecurityGroup                example-cluster                  created     
 +   │     ├─ awsx:x:ec2:EgressSecurityGroupRule   example-cluster-egress           created     
 +   │     │  └─ aws:ec2:SecurityGroupRule         example-cluster-egress           created     
 +   │     ├─ awsx:x:ec2:IngressSecurityGroupRule  example-cluster-ssh              created     
 +   │     │  └─ aws:ec2:SecurityGroupRule         example-cluster-ssh              created     
 +   │     ├─ awsx:x:ec2:IngressSecurityGroupRule  example-cluster-containers       created     
 +   │     │  └─ aws:ec2:SecurityGroupRule         example-cluster-containers       created     
 +   │     └─ aws:ec2:SecurityGroup                example-cluster                  created     
 +   └─ awsx:x:ec2:Vpc                             default-vpc-d61654b3             created     
 +      ├─ awsx:x:ec2:Subnet                       default-vpc-d61654b3-public-1    created     
 +      └─ awsx:x:ec2:Subnet                       default-vpc-d61654b3-public-0    created     
```

Otherwise if you just specify the cluster, it will create new security groups, and say it is going to create the default vpc again (but doesn't)

```
+   pulumi:pulumi:Stack                           get-cluster-2-get-cluster-example-2            create     1 error
 +   ├─ awsx:x:ecs:Cluster                         example-crosswalk-cluster-from-get             create     
 +   │  └─ awsx:x:ec2:SecurityGroup                example-crosswalk-cluster-from-get             create     
 +   │     ├─ awsx:x:ec2:IngressSecurityGroupRule  example-crosswalk-cluster-from-get-containers  create     
 +   │     │  └─ aws:ec2:SecurityGroupRule         example-crosswalk-cluster-from-get-containers  create     
 +   │     ├─ awsx:x:ec2:EgressSecurityGroupRule   example-crosswalk-cluster-from-get-egress      create     
 +   │     │  └─ aws:ec2:SecurityGroupRule         example-crosswalk-cluster-from-get-egress      create     
 +   │     ├─ awsx:x:ec2:IngressSecurityGroupRule  example-crosswalk-cluster-from-get-ssh         create     
 +   │     │  └─ aws:ec2:SecurityGroupRule         example-crosswalk-cluster-from-get-ssh         create     
 +   │     └─ aws:ec2:SecurityGroup                example-crosswalk-cluster-from-get             create     
 +   └─ awsx:x:ec2:Vpc                             default-vpc-d61654b3                           create     
 +      ├─ awsx:x:ec2:Subnet                       default-vpc-d61654b3-public-0                  create     
 +      └─ awsx:x:ec2:Subnet                       default-vpc-d61654b3-public-1                  create
 ```

 Solution?

 ```
 const fargateSecuityGroupIds: pulumi.Input<Array<string>> = shared.requireOutput('fargateSecuityGroupIds')

const cluster2 = new awsx.ecs.Cluster('example-crosswalk-cluster-from-get', {
    cluster: aws.ecs.Cluster.get('example-cluster', fargateClusterName),
    vpc: new awsx.ec2.Vpc('cluster-vpc', {vpc: aws.ec2.Vpc.get('cluster-vpc', fargateVpcId)}),
securityGroups: []
})
```

Questions:

* Will setting empty security groups cause downstream issues. Because it takes an array not an Input<string>[] I can't specify the existing security groups.
Even aws.ec2.SecurityGroup.get() only allows a single security group, which there is only 1 but seems odd