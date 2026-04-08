interface FetchMock {
    mockResponse: string
}

export const fetchMock = async ({ mockResponse }: FetchMock): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockResponse
}