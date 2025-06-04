import { Current, Router, STORE_NAME } from '@/router';
import { getStore } from '@sifrr/dom';

export const useRouter = () => {
  const router = getStore<Router>(STORE_NAME);
  if (!router) {
    throw Error('No router was registered beforeit was used.');
  }
  return router;
};

export const useRoute = () => {
  const router = useRouter();
  return new Proxy<Current>({} as Current, {
    get(_, prop: keyof Current) {
      return router.value.current?.[prop];
    },
    set() {
      return false;
    }
  });
};
