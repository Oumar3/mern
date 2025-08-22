import React from 'react';
import { Inbox, Send, MessageSquare, Reply } from 'lucide-react';
import { MessageType, UserType } from '../../pages/UserProfile';

interface MessagesTabProps {
  messageMenu: 'inbox' | 'sent';
  setMessageMenu: (menu: 'inbox' | 'sent') => void;
  selectedMsgId: string | null;
  setSelectedMsgId: (id: string | null) => void;
  messagesInbox: MessageType[];
  messagesSent: MessageType[];
  loadingMessages: boolean;
  openNewMessageModal: () => void;
  openReplyModal: (msg: MessageType) => void;
}

const MessagesTab: React.FC<MessagesTabProps> = ({
  messageMenu,
  setMessageMenu,
  selectedMsgId,
  setSelectedMsgId,
  messagesInbox,
  messagesSent,
  loadingMessages,
  openNewMessageModal,
  openReplyModal,
}) => (
  <div className="bg-white shadow rounded-lg p-6 mt-6 flex min-h-[500px]" style={{minHeight: 400}}>
    <div className="w-48 border-r pr-4 flex flex-col gap-2">
      <button
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${messageMenu === 'inbox' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100 text-gray-600'}`}
        onClick={() => { setMessageMenu('inbox'); setSelectedMsgId(null); }}
      >
        <Inbox size={18}/> Inbox
      </button>
      <button
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${messageMenu === 'sent' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100 text-gray-600'}`}
        onClick={() => { setMessageMenu('sent'); setSelectedMsgId(null); }}
      >
        <Send size={18}/> Sent
      </button>
      <button
        onClick={openNewMessageModal}
        className="flex items-center gap-2 px-3 py-2 mt-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
      >
        <MessageSquare size={18}/> New Message
      </button>
    </div>
    <div className="flex-1 flex">
      <div className="w-full px-4 overflow-y-auto">
        {!selectedMsgId ? (
          <>
            <h4 className="font-semibold mb-2 text-lg">{messageMenu === 'inbox' ? 'Inbox' : 'Sent Messages'}</h4>
            {loadingMessages ? (
              <div className="text-center py-8 text-gray-500">Chargement...</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {(messageMenu === 'inbox' ? messagesInbox : messagesSent).length === 0 ? (
                  <div className="text-gray-400 italic py-8">No messages</div>
                ) : (
                  (messageMenu === 'inbox' ? messagesInbox : messagesSent).map((msg: MessageType) => (
                    <li
                      key={msg._id}
                      className={`py-3 px-2 cursor-pointer hover:bg-indigo-50 rounded transition-colors ${selectedMsgId === msg._id ? 'bg-indigo-100' : ''}`}
                      onClick={() => setSelectedMsgId(msg._id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{messageMenu === 'inbox' ? `${msg.sender?.profile?.firstName} ${msg.sender?.profile?.lastName}` : `To: ${msg.recipients.map(r => r.profile?.firstName + ' ' + r.profile?.lastName).join(', ')}`}</span>
                          <span className="ml-2 text-xs text-gray-500">{messageMenu === 'inbox' ? msg.sender?.email : ''}</span>
                        </div>
                        <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-sm text-gray-700 mt-1 font-semibold truncate">{msg.subject}</div>
                    </li>
                  ))
                )}
              </ul>
            )}
          </>
        ) : (
          (() => {
            const msg = (messageMenu === 'inbox' ? messagesInbox : messagesSent).find(m => m._id === selectedMsgId);
            if (!msg) return <div className="text-gray-400 italic py-8">Message not found</div>;
            return (
              <div className="py-6">
                <button
                  className="mb-4 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm text-gray-700 flex items-center gap-2"
                  onClick={() => setSelectedMsgId(null)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                  Back
                </button>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-medium text-lg">{msg.subject}</span>
                    <div className="text-xs text-gray-500 mt-1">
                      {messageMenu === 'inbox'
                        ? `From: ${msg.sender?.profile?.firstName} ${msg.sender?.profile?.lastName} (${msg.sender?.email})`
                        : `To: ${msg.recipients.map(r => r.profile?.firstName + ' ' + r.profile?.lastName).join(', ')}`}
                    </div>
                  </div>
                  {messageMenu === 'inbox' && (
                    <button
                      className="text-indigo-600 hover:text-indigo-900 text-xs flex items-center gap-1"
                      onClick={() => openReplyModal(msg)}
                    >
                      <Reply size={14}/> Reply
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-400 mb-2">{new Date(msg.createdAt).toLocaleString()}</div>
                <div className="text-sm text-gray-700 whitespace-pre-line mb-4">{msg.body}</div>
              </div>
            );
          })()
        )}
      </div>
    </div>
  </div>
);

export default MessagesTab;
