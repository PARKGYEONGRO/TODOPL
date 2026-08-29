# todos/services.py
from .models import Tag

def Get_User_Default_Tag(user): #사용자 기본 태그 가져오기

    DefaultTag, Created = Tag.objects.get_or_create(

        user=user,

        is_default=True,

        defaults={

            'name':
                '기본',

            'color':
                'gray'

        }

    )


    return DefaultTag
