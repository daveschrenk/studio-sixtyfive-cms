export type MailingSubscriber = {
  email: string;
  name: string;
  createdAt: string;
};

export type MailingListFile = {
  siteId: string;
  updatedAt: string;
  subscribers: MailingSubscriber[];
};
