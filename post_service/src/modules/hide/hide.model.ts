import * as Interfaces from '../../interfaces';
import Hide from './hide.schema';
import { Helper } from '../../helpers';

const {
    Response: { errors },
    Validate: { _validations },
    ResMsg: {
        errors: { SOMETHING_WENT_WRONG, ALL_FIELDS_ARE_REQUIRED },
    }
} = Helper;

class HideModel {

    constructor() { }

    /**
   * @function hidePost
   * @param _hide
   * @returns hidden post
   */
    public async hidePost(_hide: Interfaces.Hide): Promise<any> {
        try {
            const { post, user, hideFrom } = _hide;
            const _errors = await _validations({ post, hideFrom });
            if (Object.keys(errors).length > 0) return errors(ALL_FIELDS_ARE_REQUIRED, _errors);

            const hidePost = new Hide({ isPostHidden: true, post, user });
            return hidePost.save();
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }
 
}

export default new HideModel();