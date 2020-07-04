package com.izerocs.smarthome.widget

import android.content.Context
import android.util.AttributeSet
import android.view.View
import android.widget.AdapterView
import androidx.appcompat.widget.AppCompatCheckedTextView
import androidx.appcompat.widget.AppCompatEditText
import androidx.appcompat.widget.AppCompatSpinner
import androidx.appcompat.widget.AppCompatTextView
import androidx.core.view.setPadding
import com.izerocs.smarthome.R
import com.izerocs.smarthome.adapter.SpinnerAdapter
import com.izerocs.smarthome.item.RoomTypeItem
import com.izerocs.smarthome.widget.form.InputLayout

/**
 * Created by IzeroCs on 2020-04-05
 */
class SpinnerView(context: Context, attributeSet: AttributeSet) : AppCompatSpinner(context, attributeSet),
    AdapterView.OnItemSelectedListener
{
    private var editTextBinder : AppCompatEditText? = null
    private val mode = attributeSet.getAttributeIntValue("http://schemas.android.com/apk/res/android",
        "spinnerMode", MODE_DIALOG)

    init {
        adapter = SpinnerAdapter(context, R.layout.spinner_item)
        onItemSelectedListener = this

        setPadding(resources.getDimensionPixelSize(R.dimen.formElementPadding))

        if (mode != MODE_DIALOG)
            setPopupBackgroundResource(R.drawable.spinner_background_popup)
    }

    override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
        if (view is AppCompatTextView) {
            view.run {
                text = (adapter.getItem(position) as SpinnerAdapter.SpinnerItem).getTitle()
                editTextBinder?.setText(text)
            }
        } else if (view is AppCompatCheckedTextView) {
            view.run {
                text = (adapter.getItem(position) as SpinnerAdapter.SpinnerItem).getTitle()
                editTextBinder?.setText(text)
            }
        }
    }

    override fun onNothingSelected(parent: AdapterView<*>?) {
        TODO("Not yet implemented")
    }

    fun getItem(position : Int) : SpinnerAdapter.SpinnerItem {
        return adapter.getItem(position) as SpinnerAdapter.SpinnerItem
    }

    fun getSelectCurrent() : SpinnerAdapter.SpinnerItem {
        return getItem(selectedItemPosition)
    }

    fun setEditTextBinder(editText : AppCompatEditText) {
        this.editTextBinder = editText
    }

    fun add(roomTypeItem : RoomTypeItem) : Unit = (adapter as SpinnerAdapter).add(roomTypeItem)

    fun setStatusError(text : String)   : Unit = (parent as InputLayout).setStatus(text, R.color.formStatusErrorText)
    fun setStatusWarning(text : String) : Unit = (parent as InputLayout).setStatus(text, R.color.formStatusWarningText)
    fun setStatusInfo(text : String)    : Unit = (parent as InputLayout).setStatus(text, R.color.formStatusInfoText)
    fun setStatusSuccess(text : String) : Unit = (parent as InputLayout).setStatus(text, R.color.formStatusSuccessText)

    fun setStatusError(resTextId : Int) : Unit   = setStatusError(context.getString(resTextId))
    fun setStatusWarning(resTextId : Int) : Unit = setStatusWarning(context.getString(resTextId))
    fun setStatusInfo(resTextId : Int) : Unit    = setStatusInfo(context.getString(resTextId))
    fun setStatusSuccess(resTextId : Int) : Unit = setStatusSuccess(context.getString(resTextId))

}