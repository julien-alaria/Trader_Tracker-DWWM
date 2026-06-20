import { API_BASE_URL } from "../config/api.js"

const API_URL = API_BASE_URL

class InstanceHttp {

    getHeaders(data) {
        const headers = {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }

        if (!(data instanceof FormData)) {
            headers["Content-Type"] = "application/json"
        }

        return headers
    }

    async handleResponse(response) {
        if (response.status === 401) {
            localStorage.removeItem("token")
            window.location.hash = "/login"
            throw new Error("Unauthorized")
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw { response: { data: errorData }, status: response.status } 
        }

        return response.json()
    }

    async get(url) {
        const response = await fetch(API_URL + url, {
            method: "GET",
            headers: this.getHeaders()
        })
        return this.handleResponse(response)
    }

    async post(url, data) {
        // using the 'body' variable which is capable of handling FormData
        const body = data instanceof FormData ? data : JSON.stringify(data)

        const response = await fetch(API_URL + url, {
            method: "POST",
            headers: this.getHeaders(data), // Adding 'data' for the Content-Type
            body: body
        })
        return this.handleResponse(response)
    }

    async put(url, data) {
        const body = data instanceof FormData ? data : JSON.stringify(data)

        const response = await fetch(API_URL + url, {
            method: "PUT",
            headers: this.getHeaders(data),
            body: body
        })
        return this.handleResponse(response)
    }

    async patch(url, data) {
        const body = data instanceof FormData ? data : JSON.stringify(data)

        const response = await fetch(API_URL + url, {
            method: "PATCH",
            headers: this.getHeaders(data),
            body: body
        })
        return this.handleResponse(response)
    }

    async delete(url) {
        const response = await fetch(API_URL + url, {
            method: "DELETE",
            headers: this.getHeaders()
        })
    return this.handleResponse(response)
    }

}

export default new InstanceHttp()