# Amazon ECR Construct Library
<!--BEGIN STABILITY BANNER-->

---

![cfn-resources: Stable](https://img.shields.io/badge/cfn--resources-stable-success.svg?style=for-the-badge)

![cdk-constructs: Stable](https://img.shields.io/badge/cdk--constructs-stable-success.svg?style=for-the-badge)

---

<!--END STABILITY BANNER-->

This package contains constructs for working with Amazon Elastic Container Registry.

## Repositories

Define a repository by creating a new instance of `Repository`. A repository
holds multiple verions of a single container image.

```ts
const repository = new ecr.Repository(this, 'Repository');
```

## Image scanning

Amazon ECR image scanning helps in identifying software vulnerabilities in your container images. You can manually scan container images stored in Amazon ECR, or you can configure your repositories to scan images when you push them to a repository. To create a new repository to scan on push, simply enable `imageScanOnPush` in the properties

```ts
const repository = new ecr.Repository(stack, 'Repo', {
  imageScanOnPush: true
});
```

To create an `onImageScanCompleted` event rule and trigger the event target

```ts
repository.onImageScanCompleted('ImageScanComplete')
  .addTarget(...)
```

### Authorization Token

Besides the Amazon ECR APIs, ECR also allows the Docker CLI or a language-specific Docker library to push and pull
images from an ECR repository. However, the Docker CLI does not support native IAM authentication methods and
additional steps must be taken so that Amazon ECR can authenticate and authorize Docker push and pull requests.
More information can be found at at [Registry Authentication](https://docs.aws.amazon.com/AmazonECR/latest/userguide/Registries.html#registry_auth).

A Docker authorization token can be obtained using the `GetAuthorizationToken` ECR API. The following code snippets
grants an IAM user access to call this API.

```ts
import * as iam from '@aws-cdk/aws-iam';

const user = new iam.User(this, 'User', { ... });
iam.AuthorizationToken.grantRead(user);
```

## Automatically clean up repositories

You can set life cycle rules to automatically clean up old images from your
repository. The first life cycle rule that matches an image will be applied
against that image. For example, the following deletes images older than
30 days, while keeping all images tagged with prod (note that the order
is important here):

```ts
repository.addLifecycleRule({ tagPrefixList: ['prod'], maxImageCount: 9999 });
repository.addLifecycleRule({ maxImageAge: cdk.Duration.days(30) });
```

### Repository deletion

When a repository is removed from a stack (or the stack is deleted), the ECR
repository will be removed according to its removal policy (which by default will
simply orphan the repository and leave it in your AWS account). If the removal
policy is set to `RemovalPolicy.DESTROY`, the repository will be deleted as long
as it does not contain any images.

To override this and force all images to get deleted during repository deletion,
enable the`autoDeleteImages` option.

```ts
const repository = new Repository(this, 'MyTempRepo', {
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteImages: true,
});
```
