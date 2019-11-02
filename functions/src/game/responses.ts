export class TokenResponse {
    constructor(public token: string, private type: string = 'token') { }
}
  
export class ErrorResponse {
    constructor(public message: string, private type: string = 'error') { }
}

export class QuestionResponse {
    constructor(public question: object, private type: string = 'question') { }
}

export class CorrectAnswerResponse {
    constructor(public pointsEarned: number, private type: string = 'correctAnswer') { }
}

export class WrongAnswerResponse {
    constructor(private type: string = 'wrongAnswer') { }
}