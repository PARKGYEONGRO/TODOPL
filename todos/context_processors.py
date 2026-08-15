from django.conf import settings


def SupabaseConfig(request):

    return {

        'SUPABASE_URL':
            settings.SUPABASE_URL,

        'SUPABASE_ANON_KEY':
            settings.SUPABASE_ANON_KEY,

    }