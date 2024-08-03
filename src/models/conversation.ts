import query from '../util/db'

const DAY_MILLISECONDS = 24 * 60 * 60 * 1000
const EXPIRY_DAYS = 30

class Conversation {
  createdAt?: Date
  updatedAt?: Date
  name: string
  id?: string

  constructor(config: {
    id?: string
    name: string
    createdAt?: Date
    updatedAt?: Date
  }) {
    this.id = config.id
    this.name = config.name
    this.createdAt = config.createdAt
    this.updatedAt = config.updatedAt
  }

  /**
   * Creates or updates an instance of a conversation in the database.
   */
  async update(): Promise<void> {
    let result
    if (this.id) {
      result = await query(
        'UPDATE conversations SET name = $1 WHERE convo_id = $2 RETURNING *;',
        [this.name, this.id]
      )
    } else {
      result = await query(
        'INSERT INTO conversations (name) VALUES ($1) RETURNING *;',
        [this.name]
      )
    }

    this.name = result.rows[0]['name']
    this.createdAt = result.rows[0]['created_at']
    this.updatedAt = result.rows[0]['updated_at']
    this.id = result.rows[0]['convo_id']

    return
  }

  /**
   * Deletes an instance of a conversation in the database.
   */
  async delete(): Promise<void> {
    if (!this.id) return
    await query(
      `
      WITH convo_deletes AS (
        DELETE FROM conversations WHERE convo_id = $1 RETURNING convo_id
      )
      DELETE FROM messages WHERE convo_id IN (SELECT convo_id from convo_deletes);
      `,
      [this.id]
    )
  }

  /**
   * Returns a date and time which this conversation and its messages will be deleted.
   * @returns The date this conversatoin and its messages will be deleted.
   */
  getDeletionDate(): Date | void {
    if (!this.updatedAt) return

    const deletionDate = new Date(this.updatedAt)
    deletionDate.setDate(this.updatedAt.getDate() + EXPIRY_DAYS)

    return deletionDate
  }

  /**
   * Queries a single conversation.
   * @param id The ID of the conversation.
   * @returns A Conversation object.
   */
  static findById = async (id: string): Promise<Conversation> => {
    const dbConversations = await query(
      'SELECT * FROM conversations WHERE convo_id = $1;',
      [id]
    )

    if (dbConversations?.rowCount && dbConversations.rowCount > 0) {
      const conversation = new Conversation({
        createdAt: dbConversations.rows[0]['created_at'],
        updatedAt: dbConversations.rows[0]['updated_at'],
        name: dbConversations.rows[0]['name'],
        id: dbConversations.rows[0]['convo_id'],
      })
      return conversation
    } else {
      throw new Error('There is no conversation with that ID.')
    }
  }

  /**
   * Returns an array of Conversations that are active.
   * @param daysOld The number of days a conversation has been inactive with no new messages.
   * @param shouldDelete Optional boolean for whether or not the returned records should be deleted.
   * @returns An array of active Conversation objects.
   */
  static findByAge = async (
    daysOld: number,
    shouldDelete: boolean = false
  ): Promise<Conversation[]> => {
    const date = new Date()
    date.setDate(date.getDate() - daysOld)

    const dbConversations = await query(
      'SELECT * FROM conversations WHERE updated_at < $1;',
      [`${date.toISOString().split('T')[0]}`]
    )

    if (shouldDelete) {
      await query(
        `
        WITH convo_deletes AS (
          DELETE FROM conversations WHERE updated_at < $1 RETURNING convo_id
        )
        DELETE FROM messages WHERE convo_id IN (SELECT convo_id from convo_deletes);
        `,
        [`${date.toISOString().split('T')[0]}`]
      )
    }

    const conversations = dbConversations.rows.map((c) => {
      return new Conversation({
        createdAt: dbConversations.rows[0]['created_at'],
        updatedAt: dbConversations.rows[0]['updated_at'],
        name: dbConversations.rows[0]['name'],
        id: dbConversations.rows[0]['convo_id'],
      })
    })

    return conversations
  }
}

export default Conversation
