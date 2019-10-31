export class TokenResponse {
    constructor(public token: string, private type: string = 'token') { }
}
  
export class ErrorResponse {
    constructor(public message: string, private type: string = 'error') { }
}

export class QuestionResponse {
    constructor(public question: object, private type: string = 'question') { }
}