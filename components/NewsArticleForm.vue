<template>
  <form class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4" @submit.prevent="save">
    <div v-if="error" class="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      {{ error }}
    </div>

    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1" for="news-title">Title</label>
      <input
        id="news-title"
        v-model="form.title"
        type="text"
        required
        class="w-full px-3 py-2 border border-slate-300 rounded-lg"
        @input="onTitleInput"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1" for="news-slug">Slug</label>
      <input
        id="news-slug"
        v-model="form.slug"
        type="text"
        required
        class="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm"
      />
      <p class="text-xs text-slate-500 mt-1">
        Used in the URL: {{ form.category === 'howto' ? '/how-to/' : '/news/' }}{{ form.slug || '…' }}
      </p>
    </div>

    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1" for="news-category">Type</label>
      <select
        id="news-category"
        v-model="form.category"
        class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
      >
        <option value="news">News</option>
        <option value="howto">How-to guide</option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1" for="news-excerpt">Short excerpt</label>
      <textarea
        id="news-excerpt"
        v-model="form.excerpt"
        rows="2"
        class="w-full px-3 py-2 border border-slate-300 rounded-lg"
        placeholder="Shown on the homepage and news list"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1" for="news-body">Article</label>
      <textarea
        id="news-body"
        v-model="form.body"
        rows="12"
        required
        class="w-full px-3 py-2 border border-slate-300 rounded-lg"
      />
    </div>

    <UnsplashImageSearch
      v-model="selectedImage"
      :suggested-query="form.title || (form.category === 'howto' ? 'dog care how to' : 'dog health news')"
    />

    <div class="flex flex-wrap gap-6">
      <label class="inline-flex items-center gap-2 text-sm text-slate-800">
        <input v-model="form.is_published" type="checkbox" class="rounded border-slate-300" />
        Published
      </label>
      <label class="inline-flex items-center gap-2 text-sm text-slate-800">
        <input v-model="form.is_featured" type="checkbox" class="rounded border-slate-300" />
        {{ form.category === 'howto' ? 'Pin to top of How to section' : 'Featured on homepage' }}
      </label>
    </div>

    <div class="flex flex-wrap gap-2 justify-end pt-2">
      <button
        type="button"
        class="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium"
        :disabled="saving"
        @click="$emit('cancel')"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold disabled:opacity-60"
        :disabled="saving"
      >
        {{ saving ? 'Saving…' : article?.id ? 'Save changes' : 'Create article' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { slugifyNewsTitle } from '~/utils/newsSlug'
import type { UnsplashSearchResult } from '~/composables/useUnsplash'

const props = defineProps<{
  article?: Record<string, any> | null
}>()

const emit = defineEmits<{
  saved: []
  cancel: []
}>()

const supabase = useSupabase()
const authStore = useAuthStore()
const error = ref('')
const saving = ref(false)
const slugTouched = ref(!!props.article?.slug)

const form = reactive({
  title: props.article?.title || '',
  slug: props.article?.slug || '',
  excerpt: props.article?.excerpt || '',
  body: props.article?.body || '',
  is_published: props.article?.is_published !== false,
  is_featured: !!props.article?.is_featured,
  category: props.article?.category === 'howto' ? 'howto' : 'news'
})

const selectedImage = ref<UnsplashSearchResult | null>(
  props.article?.image_url
    ? {
        url: props.article.image_url,
        author: props.article.image_author || 'Unsplash',
        authorUrl: props.article.image_author_url || 'https://unsplash.com',
        description: props.article.image_alt || props.article.title
      }
    : null
)

const onTitleInput = () => {
  if (!slugTouched.value) form.slug = slugifyNewsTitle(form.title)
}

watch(
  () => form.slug,
  () => {
    if (form.slug && form.slug !== slugifyNewsTitle(form.title)) slugTouched.value = true
  }
)

const save = async () => {
  error.value = ''
  saving.value = true
  try {
    const slug = slugifyNewsTitle(form.slug || form.title)
    if (!slug) throw new Error('Add a title so we can create a URL slug.')
    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      slug,
      excerpt: form.excerpt.trim() || null,
      body: form.body.trim(),
      image_url: selectedImage.value?.url || null,
      image_alt: selectedImage.value?.description || form.title.trim(),
      image_author: selectedImage.value?.author || null,
      image_author_url: selectedImage.value?.authorUrl || null,
      is_published: form.is_published,
      is_featured: form.is_featured,
      category: form.category === 'howto' ? 'howto' : 'news',
      published_at: form.is_published ? props.article?.published_at || new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    }

    const slugTaken = (message?: string) =>
      String(message || '').toLowerCase().includes('duplicate') ||
      String(message || '').includes('doghealthy_news_slug')

    if (props.article?.id) {
      const { error: updateError } = await supabase
        .from('doghealthy_news')
        .update(payload)
        .eq('id', props.article.id)
      if (updateError) {
        if (slugTaken(updateError.message)) {
          throw new Error('That slug is already in use. Change the URL slug and try again.')
        }
        throw updateError
      }
    } else {
      if (authStore.userId) payload.created_by = authStore.userId
      const { error: insertError } = await supabase.from('doghealthy_news').insert(payload)
      if (insertError) {
        if (slugTaken(insertError.message)) {
          throw new Error('That slug is already in use. Change the URL slug and try again.')
        }
        throw insertError
      }
    }
    emit('saved')
  } catch (err: any) {
    error.value = err?.message || 'Failed to save article'
  } finally {
    saving.value = false
  }
}
</script>
