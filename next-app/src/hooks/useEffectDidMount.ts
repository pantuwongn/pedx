import { DependencyList, EffectCallback, useEffect, useRef } from "react";

const useEffectDidMount = (func: EffectCallback, deps: DependencyList) => {
    const isMounted = useRef(false)
    useEffect(() => {
        if (isMounted.current) {
            func()
        } else {
            isMounted.current = true
        }
    }, deps)
}

export default useEffectDidMount