import ChatList from '@/src/components/ChatList'
import EventList from '@/src/components/EventList'

export default function CreatorChatPage() {
  return (
    <div className="grid md:grid-cols-3 gap-6 mt-4">
      <div className="md:col-span-2 space-y-3">
        <h2 className="h2">Creator Chat (all platforms)</h2>
        <ChatList />
      </div>
      <div className="space-y-3">
        <h2 className="h2">Gifts / Follows / Subs</h2>
        <EventList />
      </div>
    </div>
  )
}
