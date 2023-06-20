var Request = {
    List: [],
    AbortAll: function () {
        var _self = this;
        $.each(_self.List, (i, v) => {
            v.abort();
        });
    }
}

function getCategory() {
    var path = location.pathname.substring(1);
    path = path.split('/');
    if (path.length > 1) {
        var el = $('[data-handle="'+ path[1] +'"]');
        if (el.length) {
            return {
                id: el.data('id'),
                handle: el.data('handle')
            };
        }
    }
    return null;
}

var category = getCategory();
$currentMenu = $('[data-handle="all"]');
if (category) {
    $currentMenu = $('[data-handle="'+ category.handle +'"]');
}

if ($currentMenu.length) {
    $currentMenu.addClass('bg-gray-200 text-indigo-900');
    $currentMenu.siblings('span').removeClass('hidden');
}

function getParams() {
    var data = {
        sortValue: $('#sortValue').val()
    };

    var category = getCategory();

    console.log(category)

    if (category) {
        data.category = category.id;
    }

    var query = $('#query').val().trim();
    if (query) {
        data.query = query;
    }

    var tags = $('.tag-name:checked');
    if (tags.length) {
        var t = [];
        $.each(tags, function(i, v) {
            t.push(v.name);
        });
        data.tags = t;
    }

    return data;
}

const articles = {
    page: 1,
    pagination: {

    },

    init() {
        this.getArticles();

        $('#query').on('keypress', this.changeQuery.bind(this));
        $('#sortValue').on('change', this.filterArticles.bind(this));
        $('.tag-name').on('change', this.filterArticles.bind(this));
        $('[rel="prev"]').on('click', this.prevPage.bind(this));
        $('[rel="next"]').on('click', this.nextPage.bind(this));
    },

    changeQuery(e) {
        if (e.which == 13) {
            Request.AbortAll();
            this.getArticles(1);
        }
    },

    filterArticles(e) {
        Request.AbortAll();
        this.getArticles(1);
    },

    prevPage(e) {
        var p = this.page - 1;
        this.getArticles(p);
    },

    nextPage(e) {
        var p = this.page + 1;
        this.getArticles(p);
    },

    getArticles(p = null) {
        var that = this;
        var params = getParams();
        if (p) {
            params.page = p;
        }

        console.log(params)

        params = objectToUrlParams(params);
        Request.List.push(
            $.ajax({
                url: `/q/d/search?${params}`,
                type: 'GET',
                beforeSend: function () {
                    loading(true);
                },
                success: function(json) {
                    loading(false);
                    that.loadArticles(json.data);
                    that.page = json.current_page;
                    json.prev_page_url ? (
                        $('[rel="prev"]').removeClass('invisible').addClass('visible')
                    ) : (
                        $('[rel="prev"]').removeClass('visible').addClass('invisible')
                    );
                    json.next_page_url ? (
                        $('[rel="next"]').removeClass('invisible').addClass('visible')
                    ) : (
                        $('[rel="next"]').removeClass('visible').addClass('invisible')
                    );
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    console.log(XMLHttpRequest)
                    loading(false);
                }
            })
        );
    },

    loadArticles(data) {
        var container = $('#Articles'), length = data.length;
        container.html('');
        if (!length) {
            container.append('<li><div class="bg-purple-50 text-gray-400 mt-6 rounded-xl w-full h-32 mb-5 flex items-center justify-center transition duration-150 ease-in-out"><span>No blog posts</span></div></li>');
            return;
        }

        for (var i = 0; i < length; i++) {
            var item = data[i];
            var html = '<li>';
            html += '<div class="rounded-xl mb-5 bg-purple-100 transition duration-150 ease-in-out">';
            if (item.image) {
                html += '<div><img class="object-cover h-64 w-full rounded-t-xl" src="'+item.image+'" alt="'+item.altText+'"/></div>';
            }
            html += '<div class="flex items-center mx-6 pt-4">';
            html += '<span class="text-base text-gray-500 font-semibold mr-1">by:</span>';
            html += '<span class="text-gray-800 mr-2 text-base font-bold">Admin</span>';
            html += '<span class="font-bold text-3xl text-gray-500 mr-2">&middot;</span>';
            html += '<span class="text-gray-400 text-sm">'+item.date+'</span>';
            html += '<span class="ml-auto text-gray-600 font-semibold text-sm">' + item.ert;
            html += '</span>';
            html += '</div>';
            html += '<a class="block text-xl font-semibold mx-6 mb-2 hover:underline hover:text-blue-600" href="'+item.url+'">'+item.title+'</a>';
            html += '<div class="text-gray-700 text-base line-clamp-4 leading-6 px-6 break-words">'+item.summary+'</div>';
            html += '<div class="h-4"></div></div>';

            html += '</li>';
            container.append(html);
        }
    }
};

articles.init();

$(document).ready(function() {
    const $Sidebar = $('#ArticlesSidebar');
    if ($Sidebar.length) {
        $('#BlogSideBarToggler').on('click', function() {
            $Sidebar.removeClass('-translate-x-72').addClass('translate-x-0');
        });

        $('#SideBarClose').on('click', function() {
            $Sidebar.removeClass('translate-x-0').addClass('-translate-x-72')
        });
    }
});
