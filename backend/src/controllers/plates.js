import PlatesDataAccess from '../dataAccess/plates.js'
import {ok, serverError } from '../helpers/httpResponse.js'

export default class PlatesControllers {
    constructor () {
        this.dataAccess = new PlatesDataAccess()
    }

    async getPlates() {
        try {
            const plates = await this.dataAccess.getPlates()

            return ok(plates)
        } catch (error) {
            return serverError(error)
        }
    }

    async getAvailablePlates() {
        try {
            const plates = await this.dataAccess.getAvailablePlates()

            return ok(plates)
        } catch (error) {
            return serverError(error)
        }
    }

    async addPlate(plateData) {
        try {
            const result = await this.dataAccess.addPlate(plateData)

            return ok(result)
        } catch (error) {
            return serverError(error)
        }
    }

    async deletePlate(platesId) {
        try {
            const result = await this.dataAccess.deletePlate(platesId)

            return ok(result)
        } catch (error) {
            return serverError(error)
        }
    }

    async updatePlate(platesId, platesData) {
        try {
            const result = await this.dataAccess.updatePlate(platesId, platesData)

            return ok(result)
        } catch (error) {
            return serverError(error)
        }
    }

}