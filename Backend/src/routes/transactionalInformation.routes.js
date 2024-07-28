import { Router } from "express"
import {
    initializeInformation,
    allTransaction,
    searchAndpagination,
    searchInformation,
    statisticsInformation,
    barChart,
    pieChart,
    combineData
} from "../controllers/transactionalInformation.controller.js"

const router = Router()

router.route("/initialize").post(initializeInformation)
router.route("/all_Transaction").post(allTransaction)
router.route("/searchandpagination").post(searchAndpagination)
router.route("/search").post(searchInformation)
router.route("/statistics").post(statisticsInformation)
router.route("/bar_chart").post(barChart)
router.route("/pie_chart").post(pieChart)
router.route("/combine_data").post(combineData)


export default router