import * as functions from "firebase-functions";
import { fetchArrayItems, updateArray } from "./data-storage";
import { assert, assertUID, catchErrors } from './helpers';


///////////////////// Callable Function /////////////////////
export const addArrayItem = functions.https.onCall(
    async (data: any, context: any) => {
        console.log("Beginning Add Array Item");
        assertUID(context);
        const field = assert(data, 'field')
        const item = assert(data, 'item')

        let arrays = await fetchArrayItems()
        let my_array: any[] = arrays[field]
        if (!my_array.includes(item)){
            my_array.push(item)
            arrays[field] = my_array
            await catchErrors(updateArray(arrays))
            return true
        } 
        return false
    }
)

export const deleteArrayItem = functions.https.onCall(
    async (data: any, context: any) => {
        console.log("Beginning Delete Array Item");
        assertUID(context);
        const field = assert(data, 'field')
        const item = assert(data, 'item')

        let arrays: any = await fetchArrayItems();
        const my_index = arrays[field].indexOf(item)
        if (my_index && my_index !== -1) {
          arrays[field].splice(my_index, 1)
          return await catchErrors(updateArray(arrays));
        }
        return
    }
)

// pattern match array items like email or username
export const arraySearch = functions.https.onCall(
    async (data: any, context: any) => {
        console.log("Beginning Check For Array Item");
        assertUID(context);
        const field = assert(data, 'field')
        const item = assert(data, 'item')

        let arrays = await fetchArrayItems()
        let my_array: any[] = arrays[field]

        let found_items: any[] = [];
        for (let entry of my_array){
          if (entry.search(item) !== -1){
            found_items.push(item)
          } 
        }
        return found_items
    }
)