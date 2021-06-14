/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const Shim = require('fabric-shim');

class MyHouseContract extends Contract {

    /**
     * 確認house物件是否存在於Ledger
     * @param {*} ctx: Transation Context
     * @param {String} houseId: House ID
     * @returns true/false
     * @example myHouseExists(ctx, "house1")
     * If house1 exist return true 
     * Else return false
    */
    async myHouseExists(ctx, houseId) {
        const buffer = await ctx.stub.getState(houseId);
        return (!!buffer && buffer.length > 0);
    }

    /**
     * 新增House物件
     * @param {*} ctx: Transation Context
     * @param {String} houseId: House ID
     * @param {String} size: 坪數
     * @param {String} price: 價格
     * @param {String} district: 區域
     * @param {String} owner: 擁有者
     * @returns House JSON String: 
     * @example createMyHouse(ctx, "house1", "30", "12,000,000", "Taipei", "Tom")
     * return {"size":"30","houseId":"house1","district":"Taipei","docType":"house","price":"12,000,000","owner":"Tom"}
    */
    async createMyHouse(ctx, houseId, size, price, district, owner) {
        const exists = await this.myHouseExists(ctx, houseId);
        if (exists) {
            //throw new Error(`The house ${houseId} already exists`);
            console.error(`The house ${houseId} already exists`);
            return Shim.error(`The house ${houseId} already exists`);
        }

        // ==== Create house object and marshal to JSON ====
        let house = {
            docType: 'house',
            houseId: houseId,
            size: size,
            price: price,
            district: district,
            owner: owner
        };

        const buffer = Buffer.from(JSON.stringify(house));
        await ctx.stub.putState(houseId, buffer);


        console.info(`Result: ${JSON.stringify(house)}`);
        return JSON.stringify(house)
        //return result by Shim
        //return Shim.success(buffer);
    }

    // 嚴謹寫法，透過try...catch...finally控制執行流程
    /* async createMyHouse(ctx, houseId, size, price, district, owner) {
        console.info('============= START: Create MyHouse ===========');
        try {
            if (exists) {
                throw new Error(`The house ${houseId} already exists`);
            }
    
            // ==== Create house object and marshal to JSON ====
            let house = {
                docType: 'house',
                houseId: houseId,
                size: size,
                price: price,
                district: district,
                owner: owner
            };
    
            const buffer = Buffer.from(JSON.stringify(house));
            const error = await ctx.stub.putState(houseId, buffer);

            if (error.length == 0){
                console.info(`Result: ${JSON.stringify(house)}`);
                return Shim.success(buffer);
            } else {
                throw new Error(`Chaincode execute failed.\n ${error}`);
            }
        } catch (error) {
            console.error(`Chaincode execute with error.\n ${error}`);
            //console.error(error.message);
            //console.error(error.stack);
            return return Shim.error(`Chaincode execute with error.\n ${error}`);
        } finally {
            console.info('============= END: Create MyHouse ===========');
        }
    } */

    /**
     * 查詢House物件
     * @param {*} ctx: Transation Context
     * @param {String} houseId: House ID
     * @returns House JSON String: 
     * @example readMyHouse(ctx, "house1")
     * return {"size":"30","houseId":"house1","district":"Taipei","docType":"house","price":"12,000,000","owner":"Tom"}
    */
    async readMyHouse(ctx, houseId) {
        const exists = await this.myHouseExists(ctx, houseId);
        if (!exists) {
            console.error(`The house ${houseId} does not exists`);
            return Shim.error(`The house ${houseId} does not exists`);
        }
        const buffer = await ctx.stub.getState(houseId);
        const house = JSON.parse(buffer.toString());

        console.info(`Result: ${JSON.stringify(house)}`);
        return JSON.stringify(house);
        //return result by Shim
        //return Shim.success(buffer);
    }

    /**
     * 查詢House物件
     * @description 只要函式名稱前面加上_，此函式將不會被視為可被調用的智慧合約函式
     * @param {*} ctx: Transation Context
     * @param {String} houseId: House ID
     * @returns House Object: 
     * @example readMyHouse(ctx, "house1")
     * return {docType:"house", houseId:"house1", size:"30", price:"12,000,000", district:"Taipei", owner:"Tom"}
    */
    async _readMyHouse(ctx, houseId) {
        const exists = await this.myHouseExists(ctx, houseId);
        if (!exists) {
            console.error(`The house ${houseId} does not exists`);
            return Shim.error(`The house ${houseId} does not exists`);
        }
        const buffer = await ctx.stub.getState(houseId);
        const house = JSON.parse(buffer.toString());
        //return house Object
        return house
    }

    /**
     * 更新擁有者
     * @param {*} ctx: Transation Context
     * @param {String} houseId: House ID
     * @param {String} newOwner: 新擁有者
     * @returns House JSON String
     * @example transferMyHouse(ctx, "house1", "Mary")
     * return {"size":"30","houseId":"house1","district":"Taipei","docType":"house","price":"12,000,000","owner":"Mary"}
    */
    async transferMyHouse(ctx, houseId, newOwner) {
        const exists = await this.myHouseExists(ctx, houseId);
        if (!exists) {
            console.error(`The house ${houseId} does not exists`);
            return Shim.error(`The house ${houseId} does not exists`);
        }

        const buffer = await ctx.stub.getState(houseId);
        const house = JSON.parse(buffer.toString());

        //change the owner
        house.owner = newOwner;

        //update house to ledger
        const newBuffer = Buffer.from(JSON.stringify(house));
        await ctx.stub.putState(houseId, newBuffer);

        console.info(`Result: ${JSON.stringify(house)}`);
        return JSON.stringify(house);
        //return result by Shim
        //return Shim.success(buffer);
    }

    /**
     * 刪除House物件
     * @param {*} ctx: Transation Context
     * @param {String} houseId: House ID
     * @returns Empty
     * @example deleteMyHouse(ctx, "house1")
     * return ""
    */
    async deleteMyHouse(ctx, houseId) {
        const exists = await this.myHouseExists(ctx, houseId);
        if (!exists) {
            console.error(`The house ${houseId} does not exists`);
            return Shim.error(`The house ${houseId} does not exists`);
        }
        await ctx.stub.deleteState(houseId);

        console.info(`The house ${houseId} has deleted.`);
        return (`${houseId} has deleted.`);
        //return result by Shim
        //const buffer = Buffer.from("");
        //return Shim.success(buffer);
    }

    /**
     * 查詢特定範圍的House物件
     * @param {*} ctx: Transation Context
     * @param {String} startKey: 開始House ID
     * @param {String} endKey: 結束House ID
     * @returns House JSON String Array
     * @example queryHouseByRange(ctx, "house1", "house3")
     * return [{"size":"30","houseId":"house1","district":"Taipei","docType":"house","price":"12,000,000","owner":"Tom"},{"size":"25","houseId":"house2","district":"Kaoshiung","docType":"house","price":"fit","owner":"Alex"},{"size":"60","houseId":"house3","district":"red","docType":"house","price":"18,000,000","owner":"Bob"}]
    */
    async queryHouseByRange(ctx, startKey, endKey) {
        let resultsIterator = ctx.stub.getStateByRange(startKey, endKey);
        let allResults = [];
        for await (const res of resultsIterator) {
            allResults.push(JSON.parse(res.value.toString('utf8')));
        }

        console.info(`Result: ${JSON.stringify(allResults)}`);
        return JSON.stringify(allResults);
        //return result by Shim
        //const buffer = Buffer.from(JSON.stringify(allResults));
        //return Shim.success(buffer);
    }

    /**
     * 以擁有者查詢House物件
     * @param {*} ctx: Transation Context
     * @param {String} owner: 擁有者
     * @returns House JSON String Array
     * @example queryHouseByOwner(ctx, "Tom") 
     * return [{"size":"30","houseId":"house1","district":"Taipei","docType":"house","price":"12,000,000","owner":"Tom"}]
    */
    async queryHouseByOwner(ctx, owner) {
        let queryString = {};
        queryString.selector = {};
        queryString.selector.docType = 'house';
        queryString.selector.owner = owner;

        const queryStr = JSON.stringify(queryString);
        let resultsIterator = ctx.stub.getQueryResult(queryStr);

        let allResults = [];
        for await (const res of resultsIterator) {
            allResults.push(JSON.parse(res.value.toString('utf8')));
        }

        console.info(`Result: ${JSON.stringify(allResults)}`);
        return JSON.stringify(allResults);
        //return result by Shim
        //const buffer = Buffer.from(JSON.stringify(allResults));
        //return Shim.success(buffer);
    }

    
    /**
     * 從帳本查詢House物件交易紀錄
     * @param {*} ctx: Transation Context
     * @param {String} houseId: House ID
     * @returnsKeyModification String Array
     * @example readMyHouse(ctx, "house7")
     * return [{"timestamp":{"seconds":"1615047592","nanos":342000000},"txid":"f7b17b304ef75f2fee461ce393895fe540cb8ce088964fee18112dd3953255aa","isDelete":true,"data":"KEY DELETED"},{"timestamp":{"seconds":"1615047574","nanos":53000000},"txid":"864b5b495b3253b7aaffead6dee6a6320b066ed947a0cc8f44367b40bcdc145b","isDelete":false,"data":{"size":"audi","houseId":"house7","district":"brown","docType":"house","price":"A4","owner":"Alex"}},{"timestamp":{"seconds":"1615046815","nanos":624000000},"txid":"f5d347d653b547ffa16630a962fa48d32f58d29b7ead7b9edb4eaf4955bad6d3","isDelete":false,"data":{"docType":"house","houseId":"house7","size":"audi","price":"A4","district":"brown","owner":"Teddy"}}]
    */
    async queryHouseHistory(ctx, houseId) {
        //const exists = await this.myHouseExists(ctx, houseId);
        //if (!exists) {
        //    console.error(`The house ${houseId} does not exists`);
        //    return Shim.error(`The house ${houseId} does not exists`);
        //}

        const resultsIterator = ctx.stub.getHistoryForKey(houseId);
        let allResults = [];

        for await (const keyMod of resultsIterator) {
            const resp = {
                timestamp: keyMod.timestamp,
                txid: keyMod.txId,
                isDelete: keyMod.isDelete
            }

            if (keyMod.isDelete) {
                resp.data = 'KEY DELETED';
            } else {
                resp.data = JSON.parse(keyMod.value.toString('utf8'));
            }

            allResults.push(resp);
        }

        console.info(`Result: ${JSON.stringify(allResults)}`);
        return JSON.stringify(allResults);
        //return result by Shim
        //const buffer = Buffer.from(JSON.stringify(allResults));
        //return Shim.success(buffer);
    }

    async InitLedger(ctx){
        const houses = [
            {
                houseId: "house1",
                size: "30",
                price: "12,000,000",
                district: "Taipei",
                owner: "Tom"
            },
            {
                houseId: "house2",
                size: "25",
                price: "8,000,000",
                district: "Kaohsiung",
                owner: "Ken"
            },
            {
                houseId: "house3",
                size: "60",
                price: "18,000,000",
                district: "Taichung",
                owner: "Bom"
            },
            {
                houseId: "house4",
                size: "45",
                price: "25,000,000",
                district: "Taipei",
                owner: "Joe"
            },
            {
                houseId: "house5",
                size: "12",
                price: "3,000,000",
                district: "Yilan",
                owner: "Max"
            },
            {
                houseId: "house6",
                size: "20",
                price: "14,000,000",
                district: "New Taipe City",
                owner: "Grace"
            }
        ];

        for (const house of houses) {
            await this.createMyHouse(ctx, house.houseId, house.size, house.price, house.district, house.owner);
        }
    }

}

module.exports = MyHouseContract;
