import {IUser} from "nanosize";
import {User} from "./user.entity";

export class UserService {
    static async getOrCreate(iUser: IUser): Promise<User> {
        let user = await User.findOne(iUser.id);
        if (!user) {
            console.log("New user created", iUser);
            user = new User();
            user.id = iUser.id;
            user.created = new Date();
            user.email = iUser.email;
            await user.save();
        }
        return user;
    }
}