import { API_BASE_URL } from "../config/api.js"

const API_URL = API_BASE_URL

class InstanceHttp {

    getHeaders() {
        return {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        }
    }

    async handleResponse(response) {
        if (response.status === 401) {
            localStorage.removeItem("token")
            window.location.hash = "/login"
            throw new Error("Unauthorized")
        }

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`)
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
        const response = await fetch(API_URL + url, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        })
        return this.handleResponse(response)
    }

    async put(url, data) {
        const response = await fetch(API_URL + url, {
            method: "PUT",
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        })
        return this.handleResponse(response)
    }

    async patch(url, data) {
        const response = await fetch(API_URL + url, {
            method: "PATCH",
            headers: this.getHeaders(),
            body: JSON.stringify(data)
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