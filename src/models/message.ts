import query from '../util/db'

export enum ContentType {
  Text = 'text',
  Image = 'image',
}

class Message {
  createdAt?: Date
  updatedAt?: Date
  convoId: string
  convoName?: string
  content: string
  type: ContentType
  id?: string

  constructor(config: {
    createdAt?: Date
    updatedAt?: Date
    convoId: string
    convoName?: string
    content: string
    type: ContentType
    id?: string
  }) {
    this.createdAt = config.createdAt
    this.updatedAt = config.updatedAt
    this.convoId = config.convoId
    this.convoName = config.convoName
    this.content = config.content
    this.type = config.type
    this.id = config.id
  }

  /**
   * Creates or updates an instance of a message in the database.
   */
  async update(): Promise<void> {
    let result
    if (this.id) {
      result = await query(
        'UPDATE messages SET convo_id = $1, content = $2, type = $3 WHERE message_id = $4 RETURNING *;',
        [this.convoId, this.content, this.type, this.id]
      )
    } else {
      result = await query(
        'INSERT INTO messages (convo_id, content, type) VALUES ($1, $2, $3) RETURNING *;',
        [this.convoId, this.content, this.type]
      )
    }

    this.content = result.rows[0]['content']
    this.type = result.rows[0]['type']
    this.convoId = result.rows[0]['convo_id']
    this.convoName = result.rows[0]['conversation_name']
    this.createdAt = result.rows[0]['created_at']
    this.updatedAt = result.rows[0]['updated_at']
    this.id = result.rows[0]['message_id']

    return
  }

  /**
   * Queries messages from a conversation.
   * @param id The convoId of the conversation which to query messages.
   * @returns An array of messages.
   */
  static findByConvoId = async (
    id: string,
    limit: number = 50,
    skip: number = 0
  ): Promise<Message[]> => {
    const queryString = `
      SELECT 
        m.message_id,
        m.created_at,
        m.updated_at,
        m.convo_id,
        m.content,
        m.type,
        c.name AS conversation_name
      FROM messages m LEFT JOIN conversations c ON m.convo_id = c.convo_id
      WHERE m.convo_id = $1
    `
    let dbMessages
    if (!skip) {
      dbMessages = await query(`${queryString} LIMIT $2;`, [id, `${limit}`])
    } else {
      dbMessages = await query(`${queryString} LIMIT $2 OFFSET $3;`, [
        id,
        `${limit}`,
        `${skip}`,
      ])
    }

    const messages = dbMessages.rows.map((row) => {
      return new Message({
        createdAt: row['created_at'],
        updatedAt: row['updated_at'],
        convoId: row['convo_id'],
        convoName: row['conversation_name'],
        content: row['content'],
        type: row['type'],
        id: row['message_id'],
      })
    })

    return messages
  }
}

export default Message
