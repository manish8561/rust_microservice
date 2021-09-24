import Validator from "validator";

class Validate {

    constructor() { }

     /**
    * @function _validations
    * @param obj 
    * @returns 
    */
      public async _validations(obj: any): Promise<any> {
        let _errors: any = {};

        for (const key in obj) {
            if ((obj[key] !== undefined) || (obj[key] !== null)) {
                if (Validator.isEmpty(obj[key], { ignore_whitespace: false })) {
                    _errors[key] = `${key} is required.`;
                }
            }

            if ((obj[key] === undefined) || (obj[key] === null)) {
                _errors[key] = `${key} is required.`;
            }

            if ((key === "_id") || (key === "post")) {
                if (!Validator.isMongoId(obj[key])) {
                    _errors[key] = `Enter a valid ${key}.`;
                }
            }

            if (key === "content") {
                if (obj[key].length > 250) {
                    _errors[key] = "Content can not be more than 250 characters.";
                }
            }
        }

        return _errors;
    }

}

export default new Validate();