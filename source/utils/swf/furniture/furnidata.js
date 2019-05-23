// @flow
import IO from 'fs'

import Config, { downloadDirectory, furnidataURL, furnidataName } from './config.json'

import Path from 'path'
import Download from 'download'

import Logger from '../../logger'

import Parser from 'fast-xml-parser'

import Furniture from './furniture'

export default class FurniData {

	furniture: Furniture

	constructor() {
		this.download()
	}

	async download() {

		try {

			var URLPath = furnidataURL.concat('/', furnidataName)
			var localPath = Path.join(__dirname, downloadDirectory, furnidataName.concat('.xml'))

			await IO.exists(localPath, exists => {

				if (!exists) {

					Download(URLPath).then((data) => {

						IO.writeFile(localPath, data, 'utf8', () => {
							this.parse(data)
						})

					}).catch(error => {
						throw error
					})

				} else {

					IO.readFile(localPath, 'utf8', (error, data) => {

						if(error) {
							throw error
						}
						
						this.parse(data)	

					})
				}

			})

		} catch(error) {
			Logger.error(error)
		}

	}

	async parse(data: string) {

		try {

			var furniData = await Parser.parse(data, { 
				attributeNamePrefix : '', 
				ignoreAttributes: false, 
				parseAttributeValue: true 
			})

			if (furniData !== undefined) {

				furniData.furnidata.roomitemtypes.furnitype.forEach(item => {
					
					this.furniture = new Furniture(item.revision, item.classname)

				})

				// for (var item in furniData.roomwallitems) {
					
				// }
			}
		}

		catch(error) {
			Logger.error(error)
		}
	}
}

let furniData = new FurniData()