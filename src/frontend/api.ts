import axios from "axios";


const apiAddress = path => `http://localhost:8080${ path }`;

export const api = {
    join: async () => (await axios.post(apiAddress('/join'))).data
};
