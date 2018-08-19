import { IMessage } from '../components/Messages';
import ChannelListModel from './ChannelListModel';
import { FirebaseCollections } from './FirebaseCollections';
import firebase from 'firebase';
import ChannelModel, { IChannel } from './ChannelModel';

export default class MessagesListModel {

    constructor(public channel: ChannelModel, public sender: string) {

    }

    async loadMessages(channel: IChannel) {
        const snapshot = await ChannelListModel.collectionRef
            .doc(channel.id)
            .collection(FirebaseCollections.Messages)
            .orderBy('createdAt', 'asc')
            .get();

        return this.getMessagesFromSnapshot(snapshot);
    }

    sendMessage(message: string) {
        firebase.firestore().runTransaction(transaction => {
            return this.updateMessage(transaction, this.channel, message, this.sender);
        });
    }

    listenUpdates(id: string, cb: (error: Error | null, messages: IMessage[]) => void) {
        return ChannelListModel.collectionRef
            .doc(id)
            .collection(FirebaseCollections.Messages)
            .orderBy('createdAt', 'asc')
            .onSnapshot(snapshot => {
                const messages = this.getMessagesFromSnapshot(snapshot);
                cb(null, messages);
            });
    }
    private getMessagesFromSnapshot(snapshot: firebase.firestore.QuerySnapshot): IMessage[] {
        return snapshot.docs.map(d => ({
            ...d.data(),
            createdAt: d.data().createdAt.toDate(),
        })) as IMessage[];
    }

    private updateMessage = async (
        transaction: firebase.firestore.Transaction,
        channel: IChannel,
        message: string,
        username: string
    ) => {
        const channelRef = ChannelListModel.collectionRef.doc(channel.id);
        const snapshot = await transaction.get(channelRef);
        const messagesCount: number = snapshot.data()!.count + 1;
        const messagesCollectionRef = channelRef
            .collection(FirebaseCollections.Messages)
            .doc(messagesCount.toString());

        if (snapshot.exists) {
            transaction.update(channelRef, { count: messagesCount });
            transaction.set(messagesCollectionRef, {
                body: message,
                createdAt: new Date(),
                sender: username,
                receiver: channel.members.filter(e => e !== username)[0],
            });
        }

        return transaction;
    };
}