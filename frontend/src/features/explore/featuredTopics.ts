import { featuredTopicMetadata } from './featuredTopicMetadata';
import { topicPhotos } from './topicPhotos';

export const featuredTopics = featuredTopicMetadata.map(topic=>({...topic,photo:topicPhotos[topic.id]}));
