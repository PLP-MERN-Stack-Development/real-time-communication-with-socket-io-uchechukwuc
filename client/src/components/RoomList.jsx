import './RoomList.css';

function RoomList({ rooms, currentRoom, onRoomSelect }) {
  return (
    <div className="room-list">
      <div className="room-list-header">
        <h4>Chat Rooms</h4>
      </div>

      <div className="rooms-container">
        {rooms.length === 0 ? (
          <div className="no-rooms">
            <p>Loading rooms...</p>
          </div>
        ) : (
          rooms.map((room) => (
            <div
              key={room.name}
              className={`room-item ${currentRoom === room.name ? 'active' : ''}`}
              onClick={() => onRoomSelect(room.name)}
            >
              <div className="room-info">
                <span className="room-name">#{room.name}</span>
                <span className="room-description">{room.description}</span>
              </div>
              {room.messageCount > 0 && (
                <div className="room-stats">
                  <span className="message-count">{room.messageCount}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RoomList;