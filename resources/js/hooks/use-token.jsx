// Define the key to use in localStorage
const TOKEN_KEY = "user_token_" + Math.random().toString(36).substring(7);

/**
 * A composable to manage a unique user token in localStorage.
 */
export function useToken() {
    // A reactive reference to hold the token
    const token = ref(null);

    /**
     * Stores a new token in localStorage and updates the reactive ref.
     * @param {string} newToken The token to store.
     */
    const setToken = (newToken) => {
        try {
            localStorage.setItem(TOKEN_KEY, newToken);
            token.value = newToken;
        } catch (e) {
            console.error("Failed to set token in localStorage:", e);
        }
    };

    /**
     * Retrieves the token from localStorage on component mount.
     */
    const retrieveToken = () => {
        try {
            const storedToken = localStorage.getItem(TOKEN_KEY);
            if (storedToken) {
                token.value = storedToken;
            }
        } catch (e) {
            console.error("Failed to retrieve token from localStorage:", e);
        }
    };

    /**
     * Removes the token from localStorage and resets the reactive ref.
     */
    const removeToken = () => {
        try {
            localStorage.removeItem(TOKEN_KEY);
            token.value = null;
        } catch (e) {
            console.error("Failed to remove token from localStorage:", e);
        }
    };

    // Retrieve the token when the composable is used (i.e., on component mount)
    onMounted(retrieveToken);

    // Expose the reactive token and the functions to manage it
    return {
        token,
        setToken,
        removeToken,
    };
}
