import { User } from 'apps/generic'

export interface Vote {
  user: User
  choice: string
}

export class Poll {
  private choices: string[]
  private votes: Map<string, Vote>
  private totalVotes: Record<string, number>
  private leader: string

  constructor(choices: string[]) {
    this.choices = choices
    this.votes = new Map()
    this.totalVotes = Object.fromEntries(choices.map((v) => [v, 0]))
    this.leader = choices[0]
  }

  getLeader(): string {
    return this.leader
  }

  vote(user: User, choice: string) {
    const prevVote = this.votes.get(user.id)
    if (prevVote) this.totalVotes[prevVote.choice]--
    this.votes.set(user.id, { user, choice })
    const choiceVotes = ++this.totalVotes[choice]
    const leaderVotes = this.totalVotes[this.leader]
    if (choiceVotes > leaderVotes) this.leader = choice
  }
}
