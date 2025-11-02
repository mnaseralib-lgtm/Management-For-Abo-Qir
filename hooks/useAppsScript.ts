import { useState, useCallback } from 'react';
import { AppsScriptResponse } from '../types';

type HttpMethod = 'GET' | 'POST';

export const useAppsScript = <T,>(scriptUrl: string | null) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const exec = useCallback(async (params: Record<string, any>, method: HttpMethod = 'GET'): Promise<AppsScriptResponse<T> | null> => {
        if (!scriptUrl) {
            const msg = 'Google Apps Script URL is not set.';
            setError(msg);
            console.error(msg);
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            let response: Response;
            if (method === 'GET') {
                const url = new URL(scriptUrl);
                Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
                response = await fetch(url.toString(), {
                  method: 'GET',
                  redirect: 'follow',
                });
            } else { // POST
                const formData = new FormData();
                Object.keys(params).forEach(key => formData.append(key, params[key]));

                response = await fetch(scriptUrl, {
                    method: 'POST',
                    body: formData,
                });
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Apps Script in dev mode might return HTML, we need to handle text response
            const textResponse = await response.text();
            try {
              const result = JSON.parse(textResponse) as AppsScriptResponse<T>;
              return result;
            } catch(e) {
                console.error("Failed to parse JSON response:", textResponse);
                throw new Error("Invalid JSON response from server.");
            }

        } catch (e: any) {
            console.error('useAppsScript Error:', e);
            setError(e.message || 'An unknown error occurred.');
            return { status: 'error', message: e.message, data: null as any };
        } finally {
            setLoading(false);
        }
    }, [scriptUrl]);

    return { loading, error, exec };
};
