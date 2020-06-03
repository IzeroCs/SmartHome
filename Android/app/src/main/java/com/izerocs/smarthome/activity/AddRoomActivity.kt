package com.izerocs.smarthome.activity

import android.os.Bundle
import android.view.View
import com.izerocs.smarthome.R
import com.izerocs.smarthome.model.RoomItem
import com.izerocs.smarthome.model.RoomType
import com.izerocs.smarthome.preferences.RoomPreferences
import com.izerocs.smarthome.preferences.SharedPreferences
import com.izerocs.smarthome.widget.WavesView
import com.izerocs.smarthome.widget.form.FormLayout
import es.dmoral.toasty.Toasty
import kotlinx.android.synthetic.main.activity_add_room.*
import java.util.*

/**
 * Created by IzeroCs on 2020-04-04
 */
class AddRoomActivity : BaseActivity(),
    View.OnClickListener,
    WavesView.OnBackClickListener,
    FormLayout.OnKeypadEnterListener
{

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_add_room)
        formLayout.setOnKeypadEnterListener(this)
        addRoomButton.setOnClickListener(this)
        addRoomType.setEditTextBinder(addRoomName)

        RoomType.getTypeItems(applicationContext).forEach {
            addRoomType.add(it.getName(), it.getIconResource(), it.getType())
        }
    }

    override fun onCreatePreferences() : SharedPreferences {
        return RoomPreferences(this)
    }

    override fun onClick(v : View?) {
        if (v == addRoomButton) {
            val name : String = addRoomName.text.toString()
            val type : Int    = addRoomType.getSelectCurrent().getObject() as Int

            if (name.isEmpty()) {
                addRoomName.setStatusError(R.string.addRoomErrorRequiredName)
            } else if (!RoomType.isTypeValid(type)) {
                addRoomType.setStatusError(R.string.addRoomErrorInvalidType)
            } else if (isNameExists(name)) {
                addRoomName.setStatusError(R.string.addRoomErrorExistsName)
            } else {
                addRoomName.setText("")

                preferences.put(preferences.size()
                    .plus(1).toString(), RoomItem(this, name, type).toData())

                Toasty
                    .success(this, R.string.addRoomSuccess, Toasty.LENGTH_LONG, true).show()
            }
        }
    }

    override fun onKeypadEnterListener(view : View?) {
        formLayout.clearStatusElement()
        onClick(addRoomButton)
    }

    @Suppress("NAME_SHADOWING")
    private fun isNameExists(name : String?) : Boolean {
        if (name == null)
            return false

        val nameLowerCase = name.toLowerCase(Locale.ROOT)

        preferences.getAll()?.forEach {
            val item = preferences.getObject(it.key, RoomItem.RoomItemData::class.java)

            if (nameLowerCase == item.name.toLowerCase(Locale.ROOT))
                return@isNameExists true
        }

        return false
    }
}