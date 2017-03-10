def get_something_from_label(info, something, default=""):
    if 'labels' not in info \
            or not isinstance(info['labels'], dict):
        return default
    for key, value in info['labels'].iteritems():
        if key.split('.')[-1] == something:
            return value
    return default

def create_drawable_object(service, team=None,supers=None, loc=None, category_super=False, width=None):
     result = {
        'key': service.key,
        'text': service.name,
        'description': service.description
     }
     if loc: result['loc'] = loc
     if supers: result['supers'] = supers
     if category_super: result['category'] = 'Super'
     if team: result['team'] = team.name
     if width: result['width'] = width
     service.drawable = result
     return result


def get_rooms(drawable_array, start_x, end_x):
    result = []
    sorted_array = sort_highest(drawable_array)
    # fisrt candidate
    result.append((start_x,))
    

def sort_highest(drawable_array):
     result = list()
     for draw in drawable_array:
         inserted = False
         height = draw['loc'].split(' ')[1]
         for candidate in result:
             c_height = candidate['loc'].split(' ')[1]
             if int(c_height) < int(height):
                 result.insert(result.index(candidate), draw)
                 inserted = True
         if not inserted:
             result.append(draw)

def print_help():
    print('Usage: python create_data.py')
    print(' Args:')
    print('   --data-output <filepath>: output both type information to <filepath>')
    print('   --resource   : Show the resources to standard output')
    print('   --link       : Show the links to standard output')
    
