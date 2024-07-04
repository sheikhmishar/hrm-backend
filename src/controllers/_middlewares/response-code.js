/** @type {{[key: number]: string}} */
const statusText = {}
export const statusCodes = {}

statusText[(statusCodes.ACCEPTED = 202)] = 'Accepted'
statusText[(statusCodes.BAD_GATEWAY = 502)] = 'Bad Gateway'
statusText[(statusCodes.BAD_REQUEST = 400)] = 'Bad Request'
statusText[(statusCodes.CONFLICT = 409)] = 'Conflict'
statusText[(statusCodes.CONTINUE = 100)] = 'Continue'
statusText[(statusCodes.CREATED = 201)] = 'Created'
statusText[(statusCodes.EXPECTATION_FAILED = 417)] = 'Expectation Failed'
statusText[(statusCodes.FAILED_DEPENDENCY = 424)] = 'Failed Dependency'
statusText[(statusCodes.FORBIDDEN = 403)] = 'Forbidden'
statusText[(statusCodes.GATEWAY_TIMEOUT = 504)] = 'Gateway Timeout'
statusText[(statusCodes.GONE = 410)] = 'Gone'
statusText[(statusCodes.HTTP_VERSION_NOT_SUPPORTED = 505)] =
  'HTTP Version Not Supported'
// prettier-ignore
statusText[(statusCodes.IM_A_TEAPOT = 418)] = 'I\'m a teapot'
statusText[(statusCodes.INSUFFICIENT_SPACE_ON_RESOURCE = 419)] =
  'Insufficient Space on Resource'
statusText[(statusCodes.INSUFFICIENT_STORAGE = 507)] = 'Insufficient Storage'
statusText[(statusCodes.INTERNAL_SERVER_ERROR = 500)] = 'Server Error'
statusText[(statusCodes.LENGTH_REQUIRED = 411)] = 'Length Required'
statusText[(statusCodes.LOCKED = 423)] = 'Locked'
statusText[(statusCodes.METHOD_FAILURE = 420)] = 'Method Failure'
statusText[(statusCodes.METHOD_NOT_ALLOWED = 405)] = 'Method Not Allowed'
statusText[(statusCodes.MOVED_PERMANENTLY = 301)] = 'Moved Permanently'
statusText[(statusCodes.MOVED_TEMPORARILY = 302)] = 'Moved Temporarily'
statusText[(statusCodes.MULTI_STATUS = 207)] = 'Multi-Status'
statusText[(statusCodes.MULTIPLE_CHOICES = 300)] = 'Multiple Choices'
statusText[(statusCodes.NETWORK_AUTHENTICATION_REQUIRED = 511)] =
  'Network Authentication Required'
statusText[(statusCodes.NO_CONTENT = 204)] = 'No Content'
statusText[(statusCodes.NON_AUTHORITATIVE_INFORMATION = 203)] =
  'Non Authoritative Information'
statusText[(statusCodes.NOT_ACCEPTABLE = 406)] = 'Not Acceptable'
statusText[(statusCodes.NOT_FOUND = 404)] = 'Not Found'
statusText[(statusCodes.NOT_IMPLEMENTED = 501)] = 'Not Implemented'
statusText[(statusCodes.NOT_MODIFIED = 304)] = 'Not Modified'
statusText[(statusCodes.OK = 200)] = 'OK'
statusText[(statusCodes.PARTIAL_CONTENT = 206)] = 'Partial Content'
statusText[(statusCodes.PAYMENT_REQUIRED = 402)] = 'Payment Required'
statusText[(statusCodes.PERMANENT_REDIRECT = 308)] = 'Permanent Redirect'
statusText[(statusCodes.PRECONDITION_FAILED = 412)] = 'Precondition Failed'
statusText[(statusCodes.PRECONDITION_REQUIRED = 428)] = 'Precondition Required'
statusText[(statusCodes.PROCESSING = 102)] = 'Processing'
statusText[(statusCodes.PROXY_AUTHENTICATION_REQUIRED = 407)] =
  'Proxy Authentication Required'
statusText[(statusCodes.REQUEST_HEADER_FIELDS_TOO_LARGE = 431)] =
  'Request Header Fields Too Large'
statusText[(statusCodes.REQUEST_TIMEOUT = 408)] = 'Request Timeout'
statusText[(statusCodes.REQUEST_TOO_LONG = 413)] = 'Request Entity Too Large'
statusText[(statusCodes.REQUEST_URI_TOO_LONG = 414)] = 'Request-URI Too Long'
statusText[(statusCodes.REQUESTED_RANGE_NOT_SATISFIABLE = 416)] =
  'Requested Range Not Satisfiable'
statusText[(statusCodes.RESET_CONTENT = 205)] = 'Reset Content'
statusText[(statusCodes.SEE_OTHER = 303)] = 'See Other'
statusText[(statusCodes.SERVICE_UNAVAILABLE = 503)] = 'Service Unavailable'
statusText[(statusCodes.SWITCHING_PROTOCOLS = 101)] = 'Switching Protocols'
statusText[(statusCodes.TEMPORARY_REDIRECT = 307)] = 'Temporary Redirect'
statusText[(statusCodes.TOO_MANY_REQUESTS = 429)] = 'Too Many Requests'
statusText[(statusCodes.UNAUTHORIZED = 401)] = 'Unauthorized'
statusText[(statusCodes.UNPROCESSABLE_ENTITY = 422)] = 'Unprocessable Entity'
statusText[(statusCodes.UNSUPPORTED_MEDIA_TYPE = 415)] =
  'Unsupported Media Type'
statusText[(statusCodes.USE_PROXY = 305)] = 'Use Proxy'

/** @param {number} statusCode * @returns {string} */
export const getStatusText = statusCode =>
  statusText[statusCode] || `Unknown status code ${statusCode}`
