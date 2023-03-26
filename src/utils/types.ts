import { Stream } from 'stream'

export interface IGraphQLError {
  message: string | IGraphQLErrorMessage[]
  statusCode: number
  error: string
  path: string[]
}

export interface IGraphQLErrorMessage {
  code: string
  message: string
}

export interface FileUpload {
  filename: string
  mimetype: string
  encoding: string
  createReadStream: () => Stream
}
