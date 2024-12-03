import React, { useState, useEffect } from 'react';
import { UserPlus, QrCode, Camera, ArrowLeft, Phone, Video, Image, Film, Mic } from 'lucide-react';
import { ContactList } from './ContactList';
import { MessageThread } from './MessageThread';
import { MessageComposer } from './MessageComposer';
import { AddContactModal } from './AddContactModal';
import { QRScanner } from './QRScanner';
import { ProfileQRCode } from './ProfileQRCode';
import { useContacts } from '../../hooks/useContacts';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useP2PMessaging } from '../../hooks/useP2PMessaging';
import { Contact } from '../../types/message';

export function MessagingInterface() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showProfileQR, setShowProfileQR] = useState(false);
  const [showContactList, setShowContactList] = useState(true);
  const { contacts, loadContacts, saveContact, deleteContact } = useContacts();
  const { profile } = useUserProfile();
  const { sendMessage, sendMediaMessage } = useP2PMessaging();

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowContactList(false);
  };

  const handleBackToContacts = () => {
    setShowContactList(true);
    setSelectedContact(null);
  };

  const handleAddContact = async (contactData: { name: string; publicKey: string }) => {
    await saveContact(contactData);
    setShowAddContact(false);
  };

  const handleScanQR = (data: { id: string; name: string; publicKey: string }) => {
    handleAddContact({ name: data.name, publicKey: data.publicKey });
    setShowQRScanner(false);
  };

  const renderContactList = () => (
    <div className="h-full p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="terminal-text text-xs">CONTACTS</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowProfileQR(true)}
            className="terminal-button p-1.5"
            aria-label="Show QR code"
          >
            <QrCode className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowQRScanner(true)}
            className="terminal-button p-1.5"
            aria-label="Scan QR code"
          >
            <Camera className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowAddContact(true)}
            className="terminal-button p-1.5"
            aria-label="Add contact"
          >
            <UserPlus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ContactList
        contacts={contacts}
        onSelectContact={handleSelectContact}
        onDeleteContact={deleteContact}
        selectedContactId={selectedContact?.id}
      />
    </div>
  );

  const renderChatArea = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b border-[#00ff9d]">
        <button
          onClick={handleBackToContacts}
          className="terminal-button p-1.5 md:hidden"
          aria-label="Back to contacts"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="terminal-text text-xs flex-1">
          CHAT WITH {selectedContact?.name}
        </h2>
        <div className="flex gap-2">
          <button className="terminal-button p-1.5">
            <Phone className="h-4 w-4" />
          </button>
          <button className="terminal-button p-1.5">
            <Video className="h-4 w-4" />
          </button>
          <button className="terminal-button p-1.5">
            <Image className="h-4 w-4" />
          </button>
          <button className="terminal-button p-1.5">
            <Film className="h-4 w-4" />
          </button>
          <button className="terminal-button p-1.5">
            <Mic className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <MessageThread
          messages={[]}
          currentUserId={profile?.id || ''}
        />
      </div>

      <div className="p-4 bg-black border-t border-[#00ff9d] mt-auto">
        <MessageComposer
          onSendMessage={sendMessage}
          onSendMedia={sendMediaMessage}
          recipientName={selectedContact?.name || ''}
        />
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col md:flex-row">
      <div className={`
        ${showContactList ? 'block' : 'hidden md:block'}
        w-full md:w-64 md:border-r md:border-[#00ff9d]
        ${selectedContact ? 'md:block' : 'block'}
      `}>
        {renderContactList()}
      </div>

      <div className={`
        flex-1 flex flex-col min-h-0
        ${showContactList ? 'hidden md:flex' : 'flex'}
      `}>
        {selectedContact ? (
          renderChatArea()
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="terminal-text text-xs text-[#00ff9d]/70">
              Select a contact to start messaging
            </p>
          </div>
        )}
      </div>

      {showAddContact && (
        <AddContactModal
          onClose={() => setShowAddContact(false)}
          onSave={handleAddContact}
        />
      )}

      {showQRScanner && (
        <QRScanner
          onScan={handleScanQR}
          onClose={() => setShowQRScanner(false)}
        />
      )}

      {showProfileQR && profile && (
        <ProfileQRCode
          qrCode={profile.qrCode}
          publicKey={profile.publicKey}
          onClose={() => setShowProfileQR(false)}
        />
      )}
    </div>
  );
}