import {useState} from "react"
import apiFetch from "../../utils/apiFetch"

export type LoginFormProps = {
    setAuthOpen: React.Dispatch<React.SetStateAction<boolean>>
    authEmailRef: React.RefObject<HTMLInputElement>
    showPassword: boolean,
    setShowPassword: React.Dispatch<React.SetStateAction<boolean>>
    setAuthMode: React.Dispatch<React.SetStateAction<string>>
}

export type LoginFormState = {
  identifier: string
  password: string
}

export function useLoginForm() {
  const [loginForm, setLoginForm] = useState<LoginFormState>({
    identifier: "",
    password: ""
  })

  const reset = () => {
    setLoginForm({
      identifier: "",
      password: ""
    })
  }

  const handleFieldChange = <Field extends keyof LoginFormState>(
    field: Field,
    value: LoginFormState[Field]
  ) => {
    setLoginForm(prev => ({ ...prev, [field]: value }))
  }

  const login = async (event) => {
    const payload = { 
        "username": loginForm.identifier, 
        "password": loginForm.password
    }

    try
    {
        const data = await apiFetch("/auth/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload),
        });

        return data;
    }
    
    catch (error)
    {
        throw error;
    }
  }

  return {
    loginForm,
    setLoginForm,
    reset,
    handleFieldChange,
    login
  }
}