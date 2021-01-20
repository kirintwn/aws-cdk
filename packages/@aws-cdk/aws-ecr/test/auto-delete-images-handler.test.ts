const mockECRClient = {
  listImages: jest.fn().mockReturnThis(),
  batchDeleteImage: jest.fn().mockReturnThis(),
  promise: jest.fn(),
};

import { handler } from '../lib/auto-delete-images-handler';

jest.mock('aws-sdk', () => {
  return { ECR: jest.fn(() => mockECRClient) };
});

beforeEach(() => {
  mockECRClient.listImages.mockReturnThis();
  mockECRClient.batchDeleteImage.mockReturnThis();
});

afterEach(() => {
  jest.resetAllMocks();
});

test('does nothing on create event', async () => {
  // GIVEN
  const event: Partial<AWSLambda.CloudFormationCustomResourceCreateEvent> = {
    RequestType: 'Create',
    ResourceProperties: {
      ServiceToken: 'Foo',
      RepositoryName: 'MyRepo',
    },
  };

  // WHEN
  await invokeHandler(event);

  // THEN
  expect(mockECRClient.listImages).toHaveBeenCalledTimes(0);
  expect(mockECRClient.batchDeleteImage).toHaveBeenCalledTimes(0);
});

test('does nothing on update event', async () => {
  // GIVEN
  const event: Partial<AWSLambda.CloudFormationCustomResourceUpdateEvent> = {
    RequestType: 'Update',
    ResourceProperties: {
      ServiceToken: 'Foo',
      RepositoryName: 'MyRepo',
    },
  };

  // WHEN
  await invokeHandler(event);

  // THEN
  expect(mockECRClient.listImages).toHaveBeenCalledTimes(0);
  expect(mockECRClient.batchDeleteImage).toHaveBeenCalledTimes(0);
});

test('deletes no objects on delete event when repository has no objects', async () => {
  // GIVEN
  mockECRClient.promise.mockResolvedValue({ imageIds: [] }); // listedImages() call

  // WHEN
  const event: Partial<AWSLambda.CloudFormationCustomResourceDeleteEvent> = {
    RequestType: 'Delete',
    ResourceProperties: {
      ServiceToken: 'Foo',
      RepositoryName: 'MyRepo',
    },
  };
  await invokeHandler(event);

  // THEN
  expect(mockECRClient.listImages).toHaveBeenCalledTimes(1);
  expect(mockECRClient.listImages).toHaveBeenCalledWith({ repositoryName: 'MyRepo' });
  expect(mockECRClient.batchDeleteImage).toHaveBeenCalledTimes(0);
});


// helper function to get around TypeScript expecting a complete event object,
// even though our tests only need some of the fields
async function invokeHandler(event: Partial<AWSLambda.CloudFormationCustomResourceEvent>) {
  return handler(event as AWSLambda.CloudFormationCustomResourceEvent);
}
